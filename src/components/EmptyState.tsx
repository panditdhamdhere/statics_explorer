import { type ReactNode } from "react";

export function EmptyState({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel px-5 py-10 text-center">
      <p className="text-sm text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted">{detail}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
