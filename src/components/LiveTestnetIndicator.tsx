"use client";

import { ROBINHOOD_TESTNET_CHAIN_ID, ROBINHOOD_TESTNET_NAME } from "@/config/network";
import { useRpcHealth } from "@/hooks/useRpcHealth";

export function LiveTestnetIndicator() {
  const health = useRpcHealth();

  if (health.unavailable) {
    return (
      <span className="terminal-line">
        Testnet connection unavailable
      </span>
    );
  }

  return (
    <span className="terminal-line">
      <strong>LIVE TESTNET</strong>
      <span className="ml-3 hidden sm:inline">
        {ROBINHOOD_TESTNET_NAME} · chain {ROBINHOOD_TESTNET_CHAIN_ID}
        {health.blockNumber !== undefined ? ` · block ${health.blockNumber.toString()}` : ""}
      </span>
    </span>
  );
}
