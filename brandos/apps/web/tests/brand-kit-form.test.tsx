import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrandKitForm } from "@/components/brand-kit-form";

describe("BrandKitForm", () => {
  it("submits values", () => {
    const onSubmit = vi.fn();
    render(
      <BrandKitForm
        defaultValues={{
          palette: { primary: "#000000" },
          typography: { primary: "Sans" },
          tokens: {},
          tone: "Bold"
        }}
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByLabelText("Tone of voice");
    fireEvent.change(input, { target: { value: "Warm" } });
    fireEvent.submit(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "Warm" })
    );
  });
});
