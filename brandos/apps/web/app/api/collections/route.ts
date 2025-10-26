import { NextRequest, NextResponse } from "next/server";
import { collectionSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const data = collectionSchema.parse(await request.json());
  const collection = await prisma.collection.create({
    data: {
      orgId,
      name: data.name,
      schema: data.schema
    }
  });
  return NextResponse.json(collection);
}
