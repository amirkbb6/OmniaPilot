import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enqueueSyncJob } from "@/lib/sync";

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  const orgId = request.headers.get("x-org-id");
  if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 400 });
  const job = await prisma.syncJob.findUnique({ where: { id: params.jobId, orgId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await enqueueSyncJob(orgId, job.direction, job.kind, job.payload);
  await prisma.syncJob.update({
    where: { id: job.id },
    data: { status: "RETRY" }
  });
  return NextResponse.json({ ok: true });
}
