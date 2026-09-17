"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/config/network";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/format";
import { toUserErrorMessage } from "@/lib/errors";

const emptySubscribe = () => () => {};

function connectorLabel(connector: { id: string; name: string }) {
  if (connector.id === "walletConnect") return "WalletConnect";
  if (connector.id === "injected" || connector.name === "Injected") {
    return "Browser wallet";
  }
  return connector.name;
}

function connectorHint(connector: { id: string }) {
  if (connector.id === "walletConnect") return "QR / mobile";
  return "EIP-1193";
}

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
              "Couldn't switch to Robinhood Chain Testnet.",
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
              No wallet found.
            </p>
          ) : (
            uniqueConnectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-panel-2"
                onClick={() => {
                  connect(
                    connector.id === "walletConnect"
                      ? { connector }
                      : { connector, chainId: ROBINHOOD_TESTNET_CHAIN_ID },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
              >
                <span>{connectorLabel(connector)}</span>
                <span className="text-[11px] text-faint">
                  {connectorHint(connector)}
                </span>
              </button>
            ))
          )}
          {connectError ? (
            <p className="px-3 pt-2 text-xs text-red-300">
              {toUserErrorMessage(
                connectError,
                connectError.message || "Couldn't connect.",
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
