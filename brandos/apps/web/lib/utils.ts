import crypto from "node:crypto";

export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(" ");
}

export function createHmacSignature(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function safeCompare(a: string, b: string) {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
