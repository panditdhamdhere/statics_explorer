"use client";

import { useAccount } from "wagmi";
import { useSyncExternalStore } from "react";
import { ROBINHOOD_TESTNET_CHAIN_ID, ROBINHOOD_TESTNET_NAME } from "@/config/network";
import { truncateAddress } from "@/lib/format";

const emptySubscribe = () => () => {};

export function NetworkStatus() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { isConnected, chainId, address } = useAccount();

  if (!mounted || !isConnected) {
    return (
      <p className="text-[12px] text-muted">
        {ROBINHOOD_TESTNET_NAME}
        <span className="ml-3 hidden sm:inline">Wallet disconnected</span>
      </p>
    );
  }

  const correct = chainId === ROBINHOOD_TESTNET_CHAIN_ID;

  return (
    <p className="text-[12px] text-muted">
      <span className={correct ? "font-medium text-accent" : "font-medium text-red-300"}>
        {correct ? ROBINHOOD_TESTNET_NAME : "Wrong network"}
      </span>
      {address ? (
        <span className="ml-3 hidden sm:inline">{truncateAddress(address, 4)}</span>
      ) : null}
    </p>
  );
}
