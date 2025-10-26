# Puriva Studio BrandOS

A multi-tenant Brand Operating System for Puriva Studio featuring Shopify synchronization, asset management, and campaign orchestration.

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS + shadcn/ui tokens
- TanStack Query
- Prisma + PostgreSQL
- Auth.js (email magic link)
- MinIO (S3 compatible) for asset storage
- n8n for automation flows
- Shopify Admin & Storefront API integrations

## Getting Started

1. `pnpm i`
2. `cp .env.example .env.local`
3. Update `.env.local` with Shopify credentials if running commerce sync.
4. `docker compose up -d`
5. `pnpm prisma migrate dev && pnpm prisma db seed`
6. `pnpm dev`

Visit `http://localhost:3000/puriva` for the Puriva Studio dashboard.

### Assets
Upload logos, fonts, and additional brand files through the DAM module. Files are stored within MinIO under `/orgId/raw/`.

### Shopify Connector
1. Navigate to Commerce → Shopify Connect.
2. Enter the shop domain and Admin API token.
3. Test sync with the provided sample product entry (leggings pilates).

### Adding a New Brand
- Create an org via POST `/api/org` or via the UI.
- Seed brand kit and collections using `pnpm --filter scripts seed` as a reference.

### n8n Flows
- n8n is available at `http://localhost:9001`.
- Import the automation templates found in `/packages/scripts` to enable rendition generation, ISR revalidation, and retry queues.

## Testing
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
