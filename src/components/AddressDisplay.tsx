"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { explorerAddressUrl } from "@/lib/explorer";
import { truncateAddress, truncateHex } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type AddressDisplayProps = {
  value: string;
  label?: string;
  truncate?: boolean;
  hex?: boolean;
  explorer?: boolean;
  className?: string;
};

export function AddressDisplay({
  value,
  label,
  truncate = true,
  hex = false,
  explorer = true,
  className,
}: AddressDisplayProps) {
  const { copied, copy } = useCopyToClipboard();
  const display = truncate
    ? hex
      ? truncateHex(value, 8)
      : truncateAddress(value, 6)
    : value;
  const href =
    explorer && value.startsWith("0x") && value.length === 42
      ? explorerAddressUrl(value)
      : undefined;

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      {label ? (
        <span className="shrink-0 text-xs text-muted">{label}</span>
      ) : null}
      <code className="truncate font-mono text-[13px] text-foreground">
        {display}
      </code>
      <button
        type="button"
        onClick={() => copy(value)}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-faint hover:bg-panel-2 hover:text-foreground"
        aria-label={copied ? "Copied" : "Copy"}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-faint hover:bg-panel-2 hover:text-foreground"
          aria-label="Open in explorer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}
