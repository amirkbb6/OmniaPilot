import { NextResponse } from "next/server";
import { createOrgSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const json = await request.json();
  const body = createOrgSchema.parse(json);
  const org = await prisma.org.create({
    data: {
      name: body.name,
      slug: body.slug
    }
  });
  return NextResponse.json(org);
}
