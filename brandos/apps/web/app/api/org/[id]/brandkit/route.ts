import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateBrandKitSchema } from "@brandos/schemas";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = updateBrandKitSchema.parse(await request.json());
  const brandKit = await prisma.brandKit.upsert({
    where: { orgId: params.id },
    create: { orgId: params.id, ...body },
    update: body
  });
  await prisma.auditLog.create({
    data: {
      orgId: params.id,
      action: "BRANDKIT_UPDATE",
      target: params.id,
      meta: body
    }
  });
  return NextResponse.json(brandKit);
}
