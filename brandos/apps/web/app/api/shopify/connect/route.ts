import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shopifyConnectSchema } from "@brandos/schemas";

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = shopifyConnectSchema.parse(await request.json());
  const shop = await prisma.shopifyShop.upsert({
    where: { orgId },
    create: { orgId, ...body },
    update: body
  });
  await prisma.auditLog.create({
    data: {
      orgId,
      action: "SHOPIFY_CONNECT",
      target: shop.shopDomain,
      meta: body
    }
  });
  return NextResponse.json(shop);
}
