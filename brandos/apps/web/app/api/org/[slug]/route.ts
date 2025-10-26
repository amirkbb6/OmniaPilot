import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const org = await prisma.org.findUnique({ where: { slug: params.slug }, include: { brandKit: true } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(org);
}
