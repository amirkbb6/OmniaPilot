import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { upsertProduct } from "@/lib/shopify";
import { enqueueSyncJob } from "@/lib/sync";

export async function POST(request: NextRequest, { params }: { params: { entryId: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const entry = await prisma.entry.findUnique({ where: { id: params.entryId, orgId } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const product = await upsertProduct(orgId, entry);
  await enqueueSyncJob(orgId, "OUT", "PRODUCT", { entryId: entry.id, shopifyId: product.id });
  return NextResponse.json({ ok: true, product });
}
