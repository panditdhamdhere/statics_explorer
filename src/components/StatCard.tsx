import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  children,
  origin,
  className,
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  children?: ReactNode;
  origin?: "deployment" | "live" | "documentation" | "sdk";
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <CardTitle>{label}</CardTitle>
        {origin ? (
          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
            {origin}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        {value ? (
          <div className="break-words font-mono text-sm text-foreground">{value}</div>
        ) : null}
        {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
        {children}
      </CardContent>
    </Card>
  );
}
