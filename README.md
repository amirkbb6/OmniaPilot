# OmniaPilot

Orchestrateur déterministe **Karim Benali** — Purity Agency.
Stack : **n8n + Supabase**.

> Karim ne pense pas. Karim route.

---

## Architecture

```
Supabase (DB Webhooks)
        │
        ▼
┌─────────────────────────────────────────────────┐
│  01 — Karim Orchestrator (Event Router)         │
│                                                 │
│  Triggers :                                     │
│  • POST /webhook/supabase-events  (DB webhooks) │
│  • Cron 23h00      → Omar                       │
│  • Cron Lundi 08h  → Alex (prospection)         │
│                                                 │
│  Routing :                                      │
│  leads INSERT          → Alex                   │
│  leads.score ≥ 75      → Julie                  │
│  leads.status = signed → Sarah                  │
│  projects.brief_completed    → Salma            │
│  projects.blueprint_approved → Nabil + Lina     │
│  projects.copy_design_done   → Yanis            │
│  projects.preview_ready      → Victor           │
│  invoices.paid               → Amir (Tier 2)   │
└─────────────────────────────────────────────────┘
        │
        ▼  (chaque activation = HTTP POST vers webhook agent)
  Agent Workflows (n8n séparés)
        │
        ▼  (si action nécessite validation)
┌─────────────────────────────────────────────────┐
│  02 — Escalation Handler (Tier 3)               │
│                                                 │
│  POST /webhook/tier3-create                     │
│    → INSERT escalations                         │
│    → Email à Amir [TIER 3]                      │
│                                                 │
│  GET  /webhook/tier3-approve?id=<uuid>          │
│    → UPDATE escalations.status = approved       │
│    → Notify agent (resume)                      │
│                                                 │
│  GET  /webhook/tier3-reject?id=<uuid>           │
│    → UPDATE escalations.status = rejected       │
│    → Notify agent (cancel)                      │
│                                                 │
│  Cron horaire → expire escalades périmées       │
└─────────────────────────────────────────────────┘
        │
        ▼  (alternative : réponse email par Amir)
┌─────────────────────────────────────────────────┐
│  03 — Email Parser                              │
│                                                 │
│  IMAP → filtre [TIER 3] dans subject            │
│       → parse APPROVE/REJECT + UUID             │
│       → appel webhook tier3-approve/reject      │
└─────────────────────────────────────────────────┘

Toutes les actions → INSERT agent_logs (APPEND-ONLY)
```

---

## Structure du projet

```
OmniaPilot/
├── supabase/
│   └── schema.sql                       # Schéma complet (5 tables)
├── n8n/
│   └── workflows/
│       ├── 01_karim_orchestrator.json   # Router principal
│       ├── 02_escalation_handler.json   # Tier 3 APPROVE/REJECT
│       └── 03_email_parser.json         # Parse réponses email Amir
├── .env.example                         # Variables d'environnement
└── README.md
```

---

## Tables Supabase

| Table | Rôle |
|-------|------|
| `leads` | Prospects (score 0–100, status) |
| `projects` | Projets clients (pipeline statuts) |
| `invoices` | Factures (paid déclenche Tier 2) |
| `agent_logs` | Journal APPEND-ONLY de toutes les actions |
| `escalations` | Escalades Tier 3 en attente de validation Amir |

### agent_logs — Règle absolue

**APPEND-ONLY** : un trigger PostgreSQL interdit tout `UPDATE` et `DELETE`.
Chaque action d'agent → 1 `INSERT`.
Champs : `agent_id`, `action`, `input`, `output`, `tier`, `duration_ms`, `status`.

---

## Installation

### 1. Supabase

Appliquer le schéma dans le SQL Editor Supabase :

```sql
-- Copier-coller le contenu de supabase/schema.sql
```

Configurer les **Database Webhooks** dans le dashboard Supabase :

| Table | Events | URL cible |
|-------|--------|-----------|
| `leads` | INSERT, UPDATE | `{N8N_WEBHOOK_BASE_URL}/webhook/supabase-events` |
| `projects` | UPDATE | `{N8N_WEBHOOK_BASE_URL}/webhook/supabase-events` |
| `invoices` | UPDATE | `{N8N_WEBHOOK_BASE_URL}/webhook/supabase-events` |

### 2. Variables d'environnement n8n

```bash
cp .env.example .env
# Remplir les valeurs dans .env
```

Dans n8n → Settings → Environment Variables :
- `N8N_WEBHOOK_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `AMIR_EMAIL`
- `EMAIL_FROM`

### 3. Import des workflows n8n

Dans n8n → Workflows → Import :
1. `n8n/workflows/01_karim_orchestrator.json`
2. `n8n/workflows/02_escalation_handler.json`
3. `n8n/workflows/03_email_parser.json`

Configurer les credentials dans n8n :
- **IMAP** (workflow 03) : compte email d'Amir
- **SMTP/Email** (workflow 02) : compte email d'envoi

Activer les 3 workflows.

---

## Routing détaillé

### Supabase Events → Agents

| Condition | Agent activé | Tier |
|-----------|-------------|------|
| `leads` INSERT | **Alex** | 1 |
| `leads.score ≥ 75` | **Julie** | 1 |
| `leads.status = signed` | **Sarah** | 1 |
| `projects.status = brief_completed` | **Salma** | 1 |
| `projects.status = blueprint_approved` | **Nabil** + **Lina** (parallèle) | 1 |
| `projects.status = copy_design_done` | **Yanis** | 1 |
| `projects.status = preview_ready` | **Victor** | 1 |
| `invoices.status = paid` | **Amir** (notification) | 2 |

### Crons

| Cron | Agent | Action |
|------|-------|--------|
| `0 23 * * *` (chaque jour 23h00) | **Omar** | Rapport quotidien |
| `0 8 * * 1` (lundi 08h00) | **Alex** | Prospection semaine |

---

## Format Email Tier 3

```
Objet : [TIER 3] Action requise — {agent} — {action}

Agent : {nom}
Action : {description précise}

Contexte :
{3 lignes max}

Contenu :
{contenu si applicable}

→ APPROUVER : https://n8n.../webhook/tier3-approve?id={uuid}
→ REJETER   : https://n8n.../webhook/tier3-reject?id={uuid}

ID escalade : {uuid}
Expiration  : 24h ({timestamp})
```

Amir peut aussi répondre directement à l'email avec `APPROVE {uuid}` ou `REJECT {uuid}` dans le corps.

---

## Tiers de validation

| Tier | Déclencheur | Validation |
|------|------------|-----------|
| **Tier 1** | Automatique | Agent s'exécute directement, aucune validation |
| **Tier 2** | `invoices.paid` | Notification Amir uniquement (information) |
| **Tier 3** | Action critique | Email APPROVE/REJECT requis, expiration 24h |

---

## Webhooks exposés

| Chemin | Méthode | Usage |
|--------|---------|-------|
| `/webhook/supabase-events` | POST | Réception events DB Supabase |
| `/webhook/tier3-create` | POST | Création escalade Tier 3 |
| `/webhook/tier3-approve?id=<uuid>` | GET | Approbation Amir |
| `/webhook/tier3-reject?id=<uuid>` | GET | Rejet Amir |
| `/webhook/agent-alex` | POST | Déclenche Alex |
| `/webhook/agent-julie` | POST | Déclenche Julie |
| `/webhook/agent-sarah` | POST | Déclenche Sarah |
| `/webhook/agent-salma` | POST | Déclenche Salma |
| `/webhook/agent-nabil` | POST | Déclenche Nabil |
| `/webhook/agent-lina` | POST | Déclenche Lina |
| `/webhook/agent-yanis` | POST | Déclenche Yanis |
| `/webhook/agent-victor` | POST | Déclenche Victor |
| `/webhook/agent-omar` | POST | Déclenche Omar |
| `/webhook/agent-amir-notify` | POST | Notifie Amir (Tier 2) |
| `/webhook/agent-{nom}-resume` | POST | Reprend agent après Tier 3 |
