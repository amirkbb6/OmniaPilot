import { NextRequest, NextResponse } from "next/server";
import { campaignSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = campaignSchema.partial().parse(await request.json());
  const campaign = await prisma.campaign.update({
    where: { id: params.id, orgId },
    data: body
  });
  return NextResponse.json(campaign);
}
