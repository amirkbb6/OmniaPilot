import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const page = await prisma.page.update({
    where: { id: params.id, orgId },
    data: { status: "PUBLISHED" }
  });
  await prisma.auditLog.create({
    data: {
      orgId,
      action: "PAGE_PUBLISH",
      target: page.id,
      meta: { path: page.path }
    }
  });
  return NextResponse.json(page);
}
