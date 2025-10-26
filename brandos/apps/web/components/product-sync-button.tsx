"use client";

import { useState } from "react";
import { Button } from "@brandos/ui";

export function ProductSyncButton({ entryId, org }: { entryId: string; org: string }) {
  const [status, setStatus] = useState<string>("");
  const handleClick = async () => {
    setStatus("syncing");
    const response = await fetch(`/api/shopify/sync/product/${entryId}`, {
      method: "POST",
      headers: { "x-org-id": org }
    });
    if (response.ok) {
      setStatus("done");
    } else {
      setStatus("error");
    }
  };
  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} aria-label="Sync to Shopify">
        Sync to Shopify
      </Button>
      {status === "syncing" && <span className="text-xs text-neutral-foreground/60">Syncing…</span>}
      {status === "done" && <span className="text-xs text-green-400">Synced</span>}
      {status === "error" && <span className="text-xs text-red-400">Error</span>}
    </div>
  );
}
