import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductSyncButton } from "@/components/product-sync-button";

describe("ProductSyncButton", () => {
  it("calls sync endpoint", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    render(<ProductSyncButton entryId="entry" org="puriva" />);
    fireEvent.click(screen.getByRole("button", { name: /sync to shopify/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    (global.fetch as any).mockRestore();
  });
});
