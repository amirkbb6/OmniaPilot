"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBrandKitSchema } from "@brandos/schemas";
import { z } from "zod";
import { Button } from "@brandos/ui";

export type BrandKitFormValues = z.infer<typeof updateBrandKitSchema>;

export function BrandKitForm({ defaultValues, onSubmit }: { defaultValues: BrandKitFormValues; onSubmit: (values: BrandKitFormValues) => void }) {
  const form = useForm<BrandKitFormValues>({ defaultValues, resolver: zodResolver(updateBrandKitSchema) });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(values);
      })}
    >
      <label className="block text-sm">
        Tone of voice
        <input
          aria-label="Tone of voice"
          className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
          {...form.register("tone")}
        />
      </label>
      <Button type="submit">Save Brand Kit</Button>
    </form>
  );
}
