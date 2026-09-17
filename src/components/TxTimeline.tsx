import { cn } from "@/lib/utils";
import type { TxPhase } from "@/types/tx";

const stages = [
  { id: "prepare", label: "Prepare" },
  { id: "wallet", label: "Wallet confirmation" },
  { id: "submitted", label: "Submitted" },
  { id: "confirming", label: "Confirming" },
  { id: "confirmed", label: "Confirmed" },
  { id: "state", label: "Updated protocol state" },
] as const;

function stageIndex(phase: TxPhase, hasAfterState: boolean): number {
  switch (phase) {
    case "idle":
    case "preparing":
      return 0;
    case "awaiting-wallet":
      return 1;
    case "submitted":
      return 2;
    case "confirming":
      return 3;
    case "confirmed":
      return hasAfterState ? 5 : 4;
    case "failed":
    case "rejected":
      return -1;
    default:
      return 0;
  }
}

export function TxTimeline({
  phase,
  hasAfterState,
}: {
  phase: TxPhase;
  hasAfterState: boolean;
}) {
  const active = stageIndex(phase, hasAfterState);
  const failed = phase === "failed" || phase === "rejected";

  return (
    <ol className="space-y-2 text-sm">
      {stages.map((stage, index) => {
        const done = active > index || (phase === "confirmed" && index <= active);
        const current = active === index && !failed;
        return (
          <li key={stage.id} className="flex items-center gap-3">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                failed && current ? "bg-red-400" : done || current ? "bg-accent" : "bg-line",
              )}
            />
            <span className={cn(current || done ? "text-foreground" : "text-faint")}>
              {stage.label}
            </span>
          </li>
        );
      })}
      {failed ? (
        <li className="flex items-center gap-3 text-red-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          {phase === "rejected" ? "Rejected" : "Failed"}
        </li>
      ) : null}
    </ol>
  );
}
