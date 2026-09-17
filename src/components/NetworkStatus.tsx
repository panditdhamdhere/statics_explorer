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
      <p className="terminal-line">
        Network : <strong>{ROBINHOOD_TESTNET_NAME}</strong>
        <span className="ml-4 hidden sm:inline">
          Wallet : <strong>not connected</strong>
        </span>
      </p>
    );
  }

  const correct = chainId === ROBINHOOD_TESTNET_CHAIN_ID;

  return (
    <p className="terminal-line">
      Network :{" "}
      <span className={correct ? "font-medium text-accent" : "font-medium text-red-300"}>
        {correct ? ROBINHOOD_TESTNET_NAME : "wrong network"}
      </span>
      {address ? (
        <span className="ml-4 hidden sm:inline">
          Wallet : <strong>{truncateAddress(address, 4)}</strong>
        </span>
      ) : null}
    </p>
  );
}
