"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/config/network";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/format";
import { toUserErrorMessage } from "@/lib/errors";

const emptySubscribe = () => () => {};

export function ConnectWallet() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { address, isConnected, chainId, status } = useAccount();
  const { connectors, connect, isPending, error: connectError, reset } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching, error: switchError } =
    useSwitchChain();

  const uniqueConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      if (seen.has(connector.id)) return false;
      seen.add(connector.id);
      return true;
    });
  }, [connectors]);

  const wrongNetwork =
    isConnected && chainId !== undefined && chainId !== ROBINHOOD_TESTNET_CHAIN_ID;

  if (!mounted) {
    return (
      <Button size="sm" disabled>
        Connect wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {wrongNetwork ? (
          <Button
            variant="danger"
            size="sm"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: ROBINHOOD_TESTNET_CHAIN_ID })}
          >
            {isSwitching ? "Switching…" : "Switch network"}
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" onClick={() => disconnect()}>
          {truncateAddress(address, 4)}
        </Button>
        {switchError ? (
          <p className="w-full text-right text-xs text-red-300">
            {toUserErrorMessage(
              switchError,
              "Unable to switch to Robinhood Chain Testnet from this wallet.",
            )}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        onClick={() => {
          reset();
          setOpen((value) => !value);
        }}
        disabled={status === "connecting" || isPending}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </Button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-panel p-2 shadow-2xl">
          <p className="px-3 pb-2 pt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
            Robinhood Chain Testnet
          </p>
          {uniqueConnectors.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">
              No injected wallet was detected. Install a browser wallet to connect.
            </p>
          ) : (
            uniqueConnectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-panel-2"
                onClick={() => {
                  connect(
                    { connector, chainId: ROBINHOOD_TESTNET_CHAIN_ID },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
              >
                <span>
                  {connector.name === "Injected"
                    ? "Browser wallet"
                    : connector.name}
                </span>
                <span className="text-[11px] text-faint">EIP-1193</span>
              </button>
            ))
          )}
          {connectError ? (
            <p className="px-3 pt-2 text-xs text-red-300">
              {toUserErrorMessage(
                connectError,
                "Unable to connect the wallet. The explorer still works in read-only mode.",
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
