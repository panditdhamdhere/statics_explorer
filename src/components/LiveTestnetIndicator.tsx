"use client";

import { ROBINHOOD_TESTNET_CHAIN_ID, ROBINHOOD_TESTNET_NAME } from "@/config/network";
import { useRpcHealth } from "@/hooks/useRpcHealth";

export function LiveTestnetIndicator() {
  const health = useRpcHealth();

  if (health.unavailable) {
    return (
      <span className="text-[12px] text-muted">RPC unavailable</span>
    );
  }

  return (
    <span className="text-[12px] text-muted">
      <span className="font-medium text-accent">Testnet</span>
      <span className="ml-3 hidden sm:inline">
        {ROBINHOOD_TESTNET_NAME} · {ROBINHOOD_TESTNET_CHAIN_ID}
        {health.blockNumber !== undefined ? ` · ${health.blockNumber.toString()}` : ""}
      </span>
    </span>
  );
}
