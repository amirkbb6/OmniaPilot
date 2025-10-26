import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
// @ts-expect-error private function
import { __TEST__ } from "@/lib/shopify";

describe("Shopify mapping", () => {
  it("extracts product payload", () => {
    const entry: any = {
      id: "entry",
      slug: "demo",
      status: "PUBLISHED",
      data: {
        title: "Demo",
        body: "<p>Body</p>",
        price: 10,
        previousPrice: 12,
        images: ["https://example.com/img.jpg"]
      }
    } satisfies { data: Prisma.JsonValue };
    const payload = __TEST__.buildProductPayload(entry);
    expect(payload.title).toBe("Demo");
    expect(payload.variants[0].compare_at_price).toBe(12);
  });
});
