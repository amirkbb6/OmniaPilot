import { NextRequest, NextResponse } from "next/server";
import { pageSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = pageSchema.parse(await request.json());
  const page = await prisma.page.create({
    data: {
      orgId,
      path: body.path,
      blocks: body.blocks,
      seo: body.seo,
      status: body.status
    }
  });
  return NextResponse.json(page);
}
