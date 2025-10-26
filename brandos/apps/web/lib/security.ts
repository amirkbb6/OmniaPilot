import crypto from "node:crypto";
import { safeCompare } from "./utils";

export function verifyHmacSignature({
  header,
  secret,
  payload
}: {
  header: string | null;
  secret: string;
  payload: string;
}) {
  if (!header) return false;
  const digest = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64");
  try {
    return safeCompare(digest, header);
  } catch {
    return false;
  }
}

export function hashPayload(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
