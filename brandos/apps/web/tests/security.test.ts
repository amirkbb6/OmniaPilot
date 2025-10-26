import { describe, it, expect } from "vitest";
import { verifyHmacSignature } from "@/lib/security";
import { createHmacSignature } from "@/lib/utils";

describe("verifyHmacSignature", () => {
  it("validates signature", () => {
    const secret = "secret";
    const payload = JSON.stringify({ hello: "world" });
    const header = createHmacSignature(secret, payload);
    expect(verifyHmacSignature({ header, secret, payload })).toBe(true);
  });
});
