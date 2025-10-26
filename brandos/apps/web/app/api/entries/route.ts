import { NextRequest, NextResponse } from "next/server";
import { entrySchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";
import { enqueueSyncJob } from "@/lib/sync";

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = entrySchema.parse(await request.json());
  const entry = await prisma.entry.create({
    data: {
      orgId,
      collectionId: body.collectionId,
      slug: body.slug,
      data: body.data,
      status: body.status
    }
  });
  if (await isProductCollection(orgId, body.collectionId)) {
    await enqueueSyncJob(orgId, "OUT", "PRODUCT", { entryId: entry.id });
  }
  return NextResponse.json(entry);
}

export async function GET(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const collection = request.nextUrl.searchParams.get("collection");
  const entries = await prisma.entry.findMany({
    where: {
      orgId,
      collection: collection ? { is: { name: collection } } : undefined
    }
  });
  return NextResponse.json(entries);
}

async function isProductCollection(orgId: string, collectionId: string) {
  const collection = await prisma.collection.findFirst({ where: { id: collectionId, orgId } });
  return collection?.name === "products";
}
