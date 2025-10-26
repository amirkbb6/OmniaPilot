import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookHmac } from "@/lib/shopify";
import { prisma } from "@/lib/db";
import { enqueueSyncJob } from "@/lib/sync";

export async function POST(request: NextRequest) {
  const topic = request.headers.get("x-shopify-topic");
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? undefined;
  const raw = await request.text();
  const org = await prisma.shopifyShop.findFirst({ where: { shopDomain: shopDomain ?? "" } });
  if (!org || !verifyWebhookHmac(hmac, raw, process.env.WEBHOOK_SECRET ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = JSON.parse(raw);
  await prisma.auditLog.create({
    data: {
      orgId: org.orgId,
      action: "SHOPIFY_WEBHOOK",
      target: topic ?? "unknown",
      meta: payload
    }
  });
  const kind = mapTopicToKind(topic ?? "");
  await enqueueSyncJob(org.orgId, "IN", kind, payload);
  return NextResponse.json({ ok: true });
}

function mapTopicToKind(topic: string): "ORDER" | "PRODUCT" | "INVENTORY" | "IMAGE" | "VARIANT" {
  if (topic.includes("inventory")) return "INVENTORY";
  if (topic.includes("order")) return "ORDER";
  if (topic.includes("product")) return "PRODUCT";
  return "IMAGE";
}
