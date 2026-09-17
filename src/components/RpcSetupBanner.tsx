import { MISSING_RPC_MESSAGE } from "@/lib/errors";
import { DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL } from "@/config/network";
import { officialSources } from "@/config/sources";

export function RpcSetupBanner() {
  return (
    <div className="rounded-2xl border border-line bg-panel px-5 py-4 text-sm">
      <p className="kicker">Configuration</p>
      <p className="mt-2 font-medium text-foreground">RPC URL is not configured</p>
      <p className="mt-1 leading-6 text-muted">{MISSING_RPC_MESSAGE}</p>
      <p className="mt-3 font-mono text-xs text-accent">
        NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL=
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        Official public endpoint documented by Robinhood Chain:{" "}
        <code className="text-foreground">{DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL}</code>
        .{" "}
        <a
          href={officialSources.robinhoodConnecting}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          Connecting docs
        </a>
      </p>
    </div>
  );
}
