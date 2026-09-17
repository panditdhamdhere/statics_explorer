"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAccount, useSwitchChain } from "wagmi";
import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { ConnectWallet } from "@/components/ConnectWallet";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { TxTimeline } from "@/components/TxTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataRow, Kicker } from "@/components/ui/kicker";
import { ROBINHOOD_TESTNET_CHAIN_ID, ROBINHOOD_TESTNET_NAME } from "@/config/network";
import { officialSources } from "@/config/sources";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import { useFaucetStatus } from "@/hooks/useFaucetStatus";
import { useInteractFlow } from "@/hooks/useInteractFlow";
import { useWalletAssets } from "@/hooks/useWalletAssets";
import { explorerTxUrl } from "@/lib/explorer";
import { formatEth, formatTokenAmount } from "@/lib/format";
import { PINNED_SDK_COMMIT } from "@/config/sources";

export function InteractPage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const assets = useWalletAssets(address);
  const faucet = useFaucetStatus(address);
  const flow = useInteractFlow();
  const snapshot = assets.snapshot;
  const refetchAssets = assets.refetch;
  const refetchFaucet = faucet.refetch;
  const busy =
    flow.phase === "preparing" ||
    flow.phase === "awaiting-wallet" ||
    flow.phase === "submitted" ||
    flow.phase === "confirming";

  useEffect(() => {
    if (flow.phase !== "confirmed") return;
    void refetchAssets();
    void refetchFaucet();
  }, [flow.phase, refetchAssets, refetchFaucet]);

  return (
    <AppShell
      kicker="Interact"
      title="Mint TPA1 on testnet"
      description="A documented Robinhood Chain Testnet flow: quoteMint against StaticsDiamond, exact ERC-20 approvals, then mint. TPA1 is delivered to the connected wallet as BasketToken."
    >
      <p className="mb-8 max-w-3xl text-sm leading-6 text-muted">
        This mint does not create a PositionNFT. After TPA1 arrives in the wallet,
        inspect existing positions separately in the{" "}
        <Link href="/position" className="text-foreground underline underline-offset-4">
          PositionNFT explorer
        </Link>
        .
      </p>

      {!isConnected ? (
        <EmptyState
          title="Connect a wallet to interact"
          detail="Public reads stay available without a wallet. Minting TPA1 requires a connected wallet on Robinhood Chain Testnet."
        >
          <ConnectWallet />
        </EmptyState>
      ) : chainId !== ROBINHOOD_TESTNET_CHAIN_ID ? (
        <div className="mb-8 space-y-4">
          <ErrorState
            title="Wrong network"
            detail="This integration only submits transactions on Robinhood Chain Testnet, chain ID 46630. The app will not switch the network silently."
          />
          <Button
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: ROBINHOOD_TESTNET_CHAIN_ID })}
          >
            {isSwitching ? "Switching…" : "Switch to Robinhood Chain Testnet"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Wallet</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => assets.refetch()}
                  disabled={assets.isFetching}
                >
                  {assets.isFetching ? "Refreshing…" : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assets.status === "pending" ? (
                <LoadingState title="Reading wallet balances" />
              ) : snapshot ? (
                <div>
                  <DataRow label="Account" origin="wallet">
                    <AddressDisplay value={snapshot.account} />
                  </DataRow>
                  <DataRow label="ETH" origin="live">
                    {snapshot.nativeBalance !== undefined
                      ? formatEth(snapshot.nativeBalance)
                      : "Unavailable from current deployment/interface"}
                  </DataRow>
                  {snapshot.tokens.map((token) => (
                    <DataRow key={token.address} label={token.symbol} origin="live">
                      {token.balance !== undefined && token.decimals !== undefined
                        ? formatTokenAmount(token.balance, token.decimals)
                        : "Unavailable from current deployment/interface"}
                    </DataRow>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Unable to read wallet token balances.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need testnet assets?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted">
                Official ownerless faucet at{" "}
                <AddressDisplay
                  className="inline-flex"
                  value={staticsDeployment.contracts.staticsFaucet.address}
                />
                . Inventory is mock USDG, STATICS, TSLA, PLTR, and AMD. Cooldown is
                one day per wallet. Calldata is built with{" "}
                <code>buildTestnetFaucetClaimCall()</code>.
              </p>
              {faucet.isPending ? (
                <LoadingState title="Reading faucet" />
              ) : faucet.status ? (
                <div>
                  {faucet.status.assets.map((asset) => (
                    <DataRow
                      key={asset.token}
                      label={asset.symbol ?? asset.token}
                      origin="faucet"
                    >
                      {asset.decimals !== undefined
                        ? formatTokenAmount(asset.amount, asset.decimals)
                        : asset.amount.toString()}
                    </DataRow>
                  ))}
                  <DataRow label="Can claim" origin="live">
                    {faucet.status.canClaim ? "yes" : "no"}
                  </DataRow>
                  {faucet.status.nextClaimAt !== undefined ? (
                    <DataRow label="nextClaimAt" origin="live">
                      <span className="font-mono">{faucet.status.nextClaimAt.toString()}</span>
                    </DataRow>
                  ) : null}
                </div>
              ) : null}
              <Button
                variant="secondary"
                disabled={busy || !faucet.status?.canClaim}
                onClick={() => flow.runFaucetClaim()}
              >
                Claim faucet
              </Button>
              <p className="text-xs leading-5 text-faint">
                If the faucet cannot be claimed, follow the official onboarding
                instructions:{" "}
                <a
                  href={officialSources.onboarding}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted underline underline-offset-4"
                >
                  Testnet onboarding
                </a>
                .
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <Kicker>TPA1</Kicker>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {tpa1Basket.name}
              </p>
              <p className="mt-1 text-sm text-muted">Mint TPA1</p>

              <div className="mt-6 rounded-2xl border border-line bg-panel-2 p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {tpa1Basket.documentedFixtureCompositionLabel}
                </p>
                <p className="mb-3 text-xs leading-5 text-faint">
                  {tpa1Basket.documentedFixtureCompositionNote}
                </p>
                {tpa1Basket.documentedFixtureComposition.map((row) => (
                  <div
                    key={row.symbol}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="font-mono">{row.symbol}</span>
                    <span className="font-mono">{row.amountPerBasketToken}</span>
                  </div>
                ))}
                <p className="mt-2 text-[11px] text-faint">per BasketToken</p>
              </div>

              <div className="mt-6 max-w-xs space-y-2">
                <label className="text-[13px] text-muted" htmlFor="tpa1-shares">
                  TPA1 to mint
                </label>
                <Input
                  id="tpa1-shares"
                  value={flow.sharesInput}
                  onChange={(event) => flow.setSharesInput(event.target.value)}
                  inputMode="decimal"
                  disabled={busy}
                />
                <p className="text-xs text-faint">
                  Amount is converted with TPA1 decimals (18) into shares. Onchain{" "}
                  <code>quoteMint(0, shares)</code> is authoritative.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => flow.prepareMint()}
                >
                  {flow.phase === "preparing" ? "Preparing…" : "Quote and simulate"}
                </Button>
                {flow.currentStep && flow.phase !== "confirmed" ? (
                  <Button
                    disabled={busy || Boolean(flow.simulation && !flow.simulation.ok)}
                    onClick={() => flow.runCurrentStep()}
                  >
                    {busy
                      ? phaseLabel(flow.phase)
                      : `Sign ${flow.currentStep.label} (${flow.stepIndex + 1}/${flow.steps.length})`}
                  </Button>
                ) : null}
                <Button variant="ghost" disabled={busy} onClick={() => flow.reset()}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {flow.prepared ? (
            <Card>
              <CardHeader>
                <CardTitle>Before transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow label="Network" origin="check">
                  {ROBINHOOD_TESTNET_NAME}
                </DataRow>
                <DataRow label="Protocol" origin="check">
                  Statics
                </DataRow>
                <DataRow label="Basket" origin="check">
                  TPA1 · ID {flow.prepared.basketId.toString()}
                </DataRow>
                <DataRow label="StaticsDiamond" origin="check">
                  <AddressDisplay value={flow.prepared.diamond} />
                </DataRow>
                <DataRow label="Receiver" origin="check">
                  <AddressDisplay value={flow.prepared.receiver} />
                </DataRow>
                <DataRow label="Shares" origin="quoteMint">
                  <span className="font-mono">{flow.prepared.shares.toString()}</span>
                </DataRow>
                {flow.prepared.legs.map((leg) => (
                  <DataRow key={leg.asset} label={leg.symbol} origin="quoteMint">
                    <div className="space-y-1 text-right">
                      <div className="font-mono">
                        required{" "}
                        {leg.decimals !== undefined
                          ? formatTokenAmount(leg.amountIn, leg.decimals)
                          : leg.amountIn.toString()}
                      </div>
                      <div className="text-xs text-muted">
                        balance{" "}
                        {leg.balance !== undefined && leg.decimals !== undefined
                          ? formatTokenAmount(leg.balance, leg.decimals)
                          : "unavailable"}
                        {" · "}
                        allowance{" "}
                        {leg.allowance !== undefined && leg.decimals !== undefined
                          ? formatTokenAmount(leg.allowance, leg.decimals)
                          : "unavailable"}
                      </div>
                    </div>
                  </DataRow>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {flow.steps.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Transaction steps</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <ol className="space-y-3 text-sm">
                  {flow.steps.map((step, index) => (
                    <li key={step.id} className="flex items-start justify-between gap-3">
                      <span>
                        Step {index + 1} / {flow.steps.length}
                        <span className="mt-0.5 block text-foreground">{step.label}</span>
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
                        {index < flow.stepIndex
                          ? "done"
                          : index === flow.stepIndex
                            ? flow.phase
                            : "queued"}
                      </span>
                    </li>
                  ))}
                </ol>
                <TxTimeline phase={flow.phase} hasAfterState={Boolean(flow.after)} />
              </CardContent>
            </Card>
          ) : null}

          {flow.simulation ? (
            <Card>
              <CardHeader>
                <CardTitle>Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow label="Result" origin="eth_call">
                  {flow.simulation.ok ? "passes" : "reverted"}
                </DataRow>
                {flow.simulation.gas !== undefined ? (
                  <DataRow label="Gas estimate" origin="estimate">
                    <span className="font-mono">{flow.simulation.gas.toString()}</span>
                  </DataRow>
                ) : null}
                {flow.simulation.estimatedFee !== undefined ? (
                  <DataRow label="Estimated network fee" origin="estimate">
                    {formatEth(flow.simulation.estimatedFee)}
                  </DataRow>
                ) : flow.simulation.ok ? (
                  <DataRow label="Estimated network fee" origin="estimate">
                    Unavailable from current RPC
                  </DataRow>
                ) : null}
                {flow.simulation.error ? (
                  <p className="mt-3 text-sm leading-6 text-red-300">{flow.simulation.error}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    The transaction is not sent unless this simulation passes.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {flow.error ? <ErrorState detail={flow.error} /> : null}

          {flow.receipts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {flow.phase === "confirmed" ? "Transaction confirmed" : "Transactions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {flow.receipts.map((receipt) => (
                  <div key={receipt.hash} className="rounded-2xl border border-line bg-panel-2 p-4">
                    <DataRow label="Action">{receipt.action}</DataRow>
                    <DataRow label="Network">{ROBINHOOD_TESTNET_NAME}</DataRow>
                    <DataRow label="Transaction">
                      <AddressDisplay value={receipt.hash} hex explorer={false} />
                    </DataRow>
                    <DataRow label="Block">
                      <span className="font-mono">{receipt.blockNumber.toString()}</span>
                    </DataRow>
                    <a
                      href={explorerTxUrl(receipt.hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm text-foreground underline underline-offset-4"
                    >
                      View on Explorer
                    </a>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => assets.refetch()}>
                  Refresh state
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {flow.after && flow.before ? (
            <Card>
              <CardHeader>
                <CardTitle>What changed</CardTitle>
              </CardHeader>
              <CardContent>
                {flow.deltas.map((delta) => (
                  <DataRow key={delta.symbol} label={delta.symbol} origin="live">
                    <span className="font-mono text-sm">
                      {delta.decimals !== undefined && delta.before !== undefined
                        ? formatTokenAmount(delta.before, delta.decimals)
                        : "—"}
                      {" → "}
                      {delta.decimals !== undefined && delta.after !== undefined
                        ? formatTokenAmount(delta.after, delta.decimals)
                        : "—"}
                    </span>
                  </DataRow>
                ))}
                <p className="mt-4 text-sm leading-6 text-muted">
                  Values are wallet ERC-20 balances re-read after the confirmed
                  receipt. This mint does not mint or update a PositionNFT.
                </p>
                <Link
                  href="/position"
                  className="mt-3 inline-flex text-sm text-foreground underline underline-offset-4"
                >
                  Open PositionNFT explorer
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <details className="rounded-2xl border border-line bg-panel p-5">
            <summary className="cursor-pointer text-[13px] font-medium uppercase tracking-[0.16em] text-muted">
              Developer details
            </summary>
            <div className="mt-5 space-y-3 text-sm">
              <DataRow label="SDK commit">
                <span className="font-mono text-xs">{PINNED_SDK_COMMIT}</span>
              </DataRow>
              <DataRow label="Contract">
                {flow.currentStep ? (
                  <AddressDisplay value={flow.currentStep.contract} />
                ) : (
                  <AddressDisplay value={staticsDeployment.contracts.staticsDiamond.address} />
                )}
              </DataRow>
              <DataRow label="Function">
                {flow.currentStep?.functionName ?? "mint"}
              </DataRow>
              <DataRow label="SDK method">
                {flow.currentStep?.sdkMethod ?? "buildMintCall"}
              </DataRow>
              <DataRow label="Value">0</DataRow>
              {flow.simulation?.gas !== undefined ? (
                <DataRow label="Gas estimate">
                  <span className="font-mono">{flow.simulation.gas.toString()}</span>
                </DataRow>
              ) : null}
              {flow.currentStep ? (
                <div className="pt-2">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">
                    Parameters
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-background p-3 font-mono text-[12px] leading-5">
                    {stringifyArgs(flow.currentStep.args)}
                  </pre>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      )}
    </AppShell>
  );
}

function phaseLabel(phase: string) {
  if (phase === "awaiting-wallet") return "Confirm in wallet…";
  if (phase === "submitted") return "Submitted…";
  if (phase === "confirming") return "Confirming…";
  if (phase === "preparing") return "Simulating…";
  return "Working…";
}

function stringifyArgs(args: readonly unknown[]) {
  return JSON.stringify(
    args,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
}
