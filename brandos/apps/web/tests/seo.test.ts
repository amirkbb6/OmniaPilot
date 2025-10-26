import { describe, it, expect } from "vitest";
import { buildSeo } from "@/lib/seo";

describe("buildSeo", () => {
  it("creates metadata", () => {
    const meta = buildSeo({ title: "Title", description: "Desc", url: "https://example.com" });
    expect(meta.title).toBe("Title");
    expect(meta.openGraph?.url).toBe("https://example.com");
  });
});
