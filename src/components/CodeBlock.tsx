"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {label ?? "Example"}
        </span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-600 px-2.5 py-1 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
