"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePosition } from "@/hooks/usePosition";
import { useStaticsDeployment } from "@/hooks/useStaticsDeployment";
import { toUserErrorMessage } from "@/lib/errors";
import { formatTokenAmount } from "@/lib/format";

export function PositionPage() {
  const [value, setValue] = useState("");
  const { rpcConfigured, read, result, status, error } = usePosition();
  const { snapshot } = useStaticsDeployment();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    read(value);
  }

  return (
    <AppShell
      kicker="PositionNFT"
      title="PositionNFT explorer"
      description="Read a PositionNFT from the deployed StaticsDiamond interface. This page does not create, close, stake, or transfer positions."
    >
      <p className="mb-6 text-sm text-zinc-500">
        This page uses the deployed PositionNFT interface. Available fields depend on the deployment ABI.
      </p>

      <form onSubmit={onSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Example PositionNFT ID: 1"
          inputMode="numeric"
          aria-label="PositionNFT ID"
        />
        <Button type="submit" disabled={!rpcConfigured || status === "loading"}>
          {status === "loading" ? "Reading…" : "Read position"}
        </Button>
      </form>

      {snapshot?.nextPositionId !== undefined ? (
        <p className="mb-6 text-xs text-zinc-500">
          Live nextPositionId() is {snapshot.nextPositionId.toString()}. That value is the Diamond&apos;s next ID cursor, not proof that a given ID exists.
        </p>
      ) : null}

      {status === "idle" ? (
        <EmptyState
          title="No PositionNFT queried yet"
          detail="Enter a numeric PositionNFT ID and read the deployed interface. The explorer will not assume the ID exists."
        />
      ) : null}

      {status === "loading" ? (
        <LoadingState title="Reading PositionNFT" detail="Calling verified Diamond view methods." />
      ) : null}

      {status === "error" ? (
        <ErrorState
          detail={toUserErrorMessage(
            error,
            "Unable to read this contract on Robinhood Chain Testnet. Check the RPC configuration or try again.",
          )}
        />
      ) : null}

      {result?.status === "invalid" ? <ErrorState detail={result.message} /> : null}

      {result?.status === "not_found" ? (
        <EmptyState title="Position not readable" detail={result.message} />
      ) : null}

      {result?.status === "ok" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Position ID" value={result.positionId.toString()} />
              {result.owner ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-zinc-500">Owner</span>
                  <AddressDisplay value={result.owner} />
                </div>
              ) : (
                <Row label="Owner" value="Unavailable from current deployment/interface" />
              )}
              {result.positionState ? (
                <>
                  <Row label="exists" value={String(result.positionState.exists)} />
                  <Row label="stateNonce" value={result.positionState.stateNonce.toString()} />
                  <Row
                    label="activeLegCount"
                    value={result.positionState.activeLegCount.toString()}
                  />
                  <Row
                    label="unresolvedObligationCount"
                    value={result.positionState.unresolvedObligationCount.toString()}
                  />
                </>
              ) : null}
              {result.initializing !== undefined ? (
                <Row label="positionInitializing" value={String(result.initializing)} />
              ) : null}
              {result.closable !== undefined ? (
                <Row label="isPositionClosable" value={String(result.closable)} />
              ) : null}
            </CardContent>
          </Card>

          {result.stake ? (
            <Card>
              <CardHeader>
                <CardTitle>Staked assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row
                  label="stakedBalance"
                  value={formatTokenAmount(result.stake.stakedBalance, 18)}
                />
                <Row
                  label="claimAssetCount"
                  value={result.stake.claimAssetCount.toString()}
                />
                <Row
                  label="optedInAssetCount"
                  value={result.stake.optedInAssetCount.toString()}
                />
              </CardContent>
            </Card>
          ) : null}

          {result.portfolio ? (
            <Card>
              <CardHeader>
                <CardTitle>Position state counts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="basketCount" value={result.portfolio.basketCount.toString()} />
                <Row label="loanCount" value={result.portfolio.loanCount.toString()} />
                <Row
                  label="liquidityPositionCount"
                  value={result.portfolio.liquidityPositionCount.toString()}
                />
                <Row
                  label="globalRewardAssetCount"
                  value={result.portfolio.globalRewardAssetCount.toString()}
                />
                <Row
                  label="riskSeriesCount"
                  value={result.portfolio.riskSeriesCount.toString()}
                />
              </CardContent>
            </Card>
          ) : null}

          {result.basketCollateral && result.basketCollateral.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Basket exposure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.basketCollateral.map((item) => (
                  <div key={item.basketId.toString()} className="rounded border border-zinc-800 p-3 text-sm">
                    <Row label="basketId" value={item.basketId.toString()} />
                    <Row
                      label="depositedShares"
                      value={formatTokenAmount(item.depositedShares, 18)}
                    />
                    <Row
                      label="lockedShares"
                      value={formatTokenAmount(item.lockedShares, 18)}
                    />
                    <Row
                      label="withdrawableAfterBlock"
                      value={item.withdrawableAfterBlock.toString()}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {result.loans && result.loans.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Debt / credit information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.loans.map((loan) => (
                  <div key={loan.loanId.toString()} className="space-y-2 rounded border border-zinc-800 p-3 text-sm">
                    <Row label="loanId" value={loan.loanId.toString()} />
                    <Row label="basketId" value={loan.basketId.toString()} />
                    <Row label="collateralShares" value={formatTokenAmount(loan.collateralShares, 18)} />
                    <Row label="feeShares" value={formatTokenAmount(loan.feeShares, 18)} />
                    <Row label="debtShares" value={formatTokenAmount(loan.debtShares, 18)} />
                    <Row label="penaltyShares" value={formatTokenAmount(loan.penaltyShares, 18)} />
                    <Row label="maturity" value={String(loan.maturity)} />
                    {loan.assets.map((asset, index) => (
                      <div key={`${loan.loanId}-${asset}-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <AddressDisplay value={asset} />
                        <span className="font-mono text-zinc-300">
                          {loan.principals[index]?.toString() ?? "Unavailable from current deployment/interface"}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {(result.rewardAssets && result.rewardAssets.length > 0) ||
          (result.globalRewardAssets && result.globalRewardAssets.length > 0) ? (
            <Card>
              <CardHeader>
                <CardTitle>Reward assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(result.rewardAssets ?? result.globalRewardAssets ?? []).map((asset) => (
                  <AddressDisplay key={asset} value={asset} />
                ))}
              </CardContent>
            </Card>
          ) : null}

          {result.liquidityPositionIds && result.liquidityPositionIds.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Staked liquidity token IDs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 font-mono text-sm">
                {result.liquidityPositionIds.map((id) => (
                  <div key={id.toString()}>{id.toString()}</div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {result.tokenMetadata?.name || result.tokenMetadata?.description ? (
            <Card>
              <CardHeader>
                <CardTitle>tokenURI metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-300">
                {result.tokenMetadata.name ? <p>{result.tokenMetadata.name}</p> : null}
                {result.tokenMetadata.description ? (
                  <p className="text-zinc-400">{result.tokenMetadata.description}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {result.unavailable.length > 0 ? (
            <p className="text-xs text-zinc-500">
              Unavailable selectors: {result.unavailable.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-100">{value}</span>
    </div>
  );
}
