import { NextRequest, NextResponse } from "next/server";
import { assetUploadSchema } from "@brandos/schemas";
import { prisma } from "@/lib/db";
import { createUpload } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const body = assetUploadSchema.parse(await request.json());
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const presign = await createUpload(orgId, body.fileName, body.contentType);
  const bucket = process.env.S3_BUCKET ?? "brandos";
  const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  await prisma.asset.create({
    data: {
      orgId,
      kind: body.kind,
      title: body.title,
      url: `http://${endpoint}:${port}/${bucket}/${presign.key}`,
      meta: body.meta
    }
  });
  return NextResponse.json(presign);
}

export async function GET(request: NextRequest) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const assets = await prisma.asset.findMany({ where: { orgId } });
  return NextResponse.json(assets);
}
