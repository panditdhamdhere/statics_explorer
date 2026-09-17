export function LoadingState({
  title = "Loading",
  detail = "Reading the RPC.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-5 py-6">
      <div className="mb-4 h-1 w-16 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full w-1/2 animate-pulse bg-accent" />
      </div>
      <p className="text-sm text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}
