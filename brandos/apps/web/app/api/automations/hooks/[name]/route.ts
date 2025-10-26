import { NextRequest, NextResponse } from "next/server";
import { verifyHmacSignature } from "@/lib/security";
import { enqueueSyncJob } from "@/lib/sync";

export async function POST(request: NextRequest, { params }: { params: { name: string } }) {
  const raw = await request.text();
  const signature = request.headers.get("x-automation-signature");
  const secret = process.env.WEBHOOK_SECRET ?? "changeme_hmac";
  if (!verifyHmacSignature({ header: signature, payload: raw, secret })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const payload = JSON.parse(raw);
  const orgId = payload.orgId as string;
  await enqueueSyncJob(orgId, "IN", "ORDER", { source: "n8n", name: params.name, payload });
  return NextResponse.json({ ok: true });
}
