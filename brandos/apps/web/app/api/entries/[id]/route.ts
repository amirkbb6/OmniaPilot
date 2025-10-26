import { NextRequest, NextResponse } from "next/server";
import { entrySchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";
import { enqueueSyncJob } from "@/lib/sync";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = entrySchema.partial().parse(await request.json());
  const entry = await prisma.entry.update({
    where: { id: params.id, orgId },
    data: body
  });
  const collection = await prisma.collection.findUnique({ where: { id: entry.collectionId } });
  if (collection?.name === "products") {
    await enqueueSyncJob(orgId, "OUT", "PRODUCT", { entryId: entry.id });
  }
  return NextResponse.json(entry);
}
