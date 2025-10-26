import { NextRequest, NextResponse } from "next/server";
import { campaignSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const body = campaignSchema.parse(await request.json());
  const campaign = await prisma.campaign.create({
    data: {
      orgId,
      name: body.name,
      brief: body.brief,
      channels: body.channels,
      assets: body.assets,
      schedule: body.schedule,
      kpis: body.kpis,
      status: body.status
    }
  });
  return NextResponse.json(campaign);
}
