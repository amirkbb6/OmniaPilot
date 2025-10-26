import { NextRequest, NextResponse } from "next/server";
import { pageSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = pageSchema.partial().parse(await request.json());
  const page = await prisma.page.update({
    where: { id: params.id, orgId },
    data: body
  });
  return NextResponse.json(page);
}
