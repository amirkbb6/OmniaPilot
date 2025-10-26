import { ReactNode } from "react";
import { cn } from "../utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-neutral/60 p-6 shadow-xl shadow-black/30 backdrop-blur", className)}>
      {children}
    </div>
  );
}
