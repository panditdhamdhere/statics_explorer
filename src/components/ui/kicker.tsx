import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("kicker", className)}>{children}</p>;
}

export function DataRow({
  label,
  children,
  origin,
}: {
  label: string;
  children: ReactNode;
  origin?: string;
}) {
  return (
    <div className="data-row">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="min-w-0 text-sm text-foreground">{children}</div>
      {origin ? (
        <span className="justify-self-end font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          {origin}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}
