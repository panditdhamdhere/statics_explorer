import { DEPLOYMENT_LABEL } from "@/config/network";
import { cn } from "@/lib/utils";

export function NetworkBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {compact ? "Testnet · Beta" : DEPLOYMENT_LABEL}
    </span>
  );
}
