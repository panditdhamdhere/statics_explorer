"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { NetworkBadge } from "@/components/NetworkBadge";
import { Card, CardContent } from "@/components/ui/card";
import { DataRow, Kicker } from "@/components/ui/kicker";
import { ROBINHOOD_TESTNET_CHAIN_ID, ROBINHOOD_TESTNET_NAME } from "@/config/network";
import { officialSources } from "@/config/sources";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import { useStaticsDeployment } from "@/hooks/useStaticsDeployment";
import { toUserErrorMessage } from "@/lib/errors";
import { formatEth, formatTokenAmount } from "@/lib/format";

export function OverviewPage() {
  const { rpcConfigured, snapshot, status, error, sdk, deployment } =
    useStaticsDeployment();

  return (
    <AppShell>
      <section className="mb-12 max-w-3xl space-y-4">
        <Kicker>Explorer</Kicker>
        <h1 className="text-[2.35rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Explore the recorded Statics deployment
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted">
          A read-only developer explorer for the Statics Protocol Robinhood Chain
          Testnet integration-beta. Addresses, methods, and SDK exports are taken
          from the official deployment snapshot.
        </p>
        <NetworkBadge />
        <div className="pt-2">
          <Link
            href="/interact"
            className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Mint TPA1 on testnet
          </Link>
        </div>
      </section>

      <section className="mb-6">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="p-5 sm:p-6">
              <Kicker>Deployment</Kicker>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                Integration-beta snapshot
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Verified from the official Robinhood testnet deployment record. Not
                a production dashboard.
              </p>
              <div className="mt-6">
                <DataRow label="Network" origin="record">
                  {ROBINHOOD_TESTNET_NAME}
                </DataRow>
                <DataRow label="Chain ID" origin="record">
                  <span className="font-mono">{ROBINHOOD_TESTNET_CHAIN_ID}</span>
                </DataRow>
                <DataRow label="StaticsDiamond" origin="record">
                  <AddressDisplay value={deployment.contracts.staticsDiamond.address} />
                </DataRow>
                <DataRow label="USDstx" origin="record">
                  <AddressDisplay value={deployment.contracts.usdstx.address} />
                </DataRow>
                <DataRow label="TPA1" origin="record">
                  <AddressDisplay value={tpa1Basket.token} />
                </DataRow>
                <DataRow label="SDK" origin="pin">
                  <span className="font-mono text-[13px]">
                    {sdk.loaded ? "loaded" : "unavailable"} · {sdk.commit.slice(0, 12)}
                  </span>
                </DataRow>
              </div>
            </div>

            <div className="border-t border-line bg-panel-2 p-5 lg:border-l lg:border-t-0 sm:p-6">
              <Kicker>Live reads</Kicker>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                Diamond views
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Shown only after a successful RPC read. Missing selectors are omitted
                or labeled unavailable.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-background/70 p-4">
                {!rpcConfigured ? (
                  <p className="text-sm leading-6 text-muted">
                    Configure the RPC URL to enable live Diamond reads. Deployment
                    metadata remains available.
                  </p>
                ) : status === "loading" ? (
                  <LoadingState />
                ) : status === "error" ? (
                  <ErrorState
                    detail={toUserErrorMessage(
                      error,
                      "Unable to read this contract on Robinhood Chain Testnet. Check the RPC configuration or try again.",
                    )}
                  />
                ) : snapshot ? (
                  <div>
                    {snapshot.name ? (
                      <DataRow label="name()" origin="live">
                        {snapshot.name}
                      </DataRow>
                    ) : null}
                    {snapshot.symbol ? (
                      <DataRow label="symbol()" origin="live">
                        {snapshot.symbol}
                      </DataRow>
                    ) : null}
                    {snapshot.basketCount !== undefined ? (
                      <DataRow label="basketCount()" origin="live">
                        <span className="font-mono text-accent">
                          {snapshot.basketCount.toString()}
                        </span>
                      </DataRow>
                    ) : null}
                    {snapshot.nextPositionId !== undefined ? (
                      <DataRow label="nextPositionId()" origin="live">
                        <span className="font-mono text-accent">
                          {snapshot.nextPositionId.toString()}
                        </span>
                      </DataRow>
                    ) : null}
                    {snapshot.positionCreationFee !== undefined ? (
                      <DataRow label="positionCreationFee()" origin="live">
                        <span className="font-mono">
                          {formatEth(snapshot.positionCreationFee)}
                        </span>
                      </DataRow>
                    ) : null}
                    {snapshot.creationFee !== undefined ? (
                      <DataRow label="creationFee()" origin="live">
                        <span className="font-mono">{formatEth(snapshot.creationFee)}</span>
                      </DataRow>
                    ) : null}
                    {snapshot.totalStaked !== undefined ? (
                      <DataRow label="totalStaked()" origin="live">
                        <span className="font-mono">
                          {formatTokenAmount(snapshot.totalStaked, 18)} STATICS
                        </span>
                      </DataRow>
                    ) : null}
                    {snapshot.stakingToken ? (
                      <DataRow label="stakingToken()" origin="live">
                        <AddressDisplay value={snapshot.stakingToken} />
                      </DataRow>
                    ) : null}
                    {snapshot.staticsDollar ? (
                      <DataRow label="staticsDollar()" origin="live">
                        <AddressDisplay value={snapshot.staticsDollar} />
                      </DataRow>
                    ) : null}
                    {snapshot.weth ? (
                      <DataRow label="weth()" origin="live">
                        <AddressDisplay value={snapshot.weth} />
                      </DataRow>
                    ) : null}
                    {snapshot.unavailable.length > 0 ? (
                      <p className="pt-3 text-xs leading-5 text-muted">
                        Unavailable selectors: {snapshot.unavailable.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {snapshot?.totalStaked !== undefined ? (
                <p className="mt-3 text-[11px] leading-5 text-faint">
                  totalStaked() is onchain staking-token units. It is not TVL or APY.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <Kicker>Genesis basket</Kicker>
                <p className="mt-3 text-xl font-semibold tracking-tight">
                  {tpa1Basket.name}
                </p>
              </div>
              <Link
                href="/basket"
                className="text-[13px] text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                Open basket explorer
              </Link>
            </div>
            <DataRow label="Symbol" origin="record">
              <span className="font-mono">{tpa1Basket.symbol}</span>
            </DataRow>
            <DataRow label="Basket ID" origin="record">
              <span className="font-mono">{tpa1Basket.basketId.toString()}</span>
            </DataRow>
            <DataRow label="Basket token" origin="record">
              <AddressDisplay value={tpa1Basket.token} />
            </DataRow>
            <div className="mt-4 rounded-2xl border border-line bg-panel-2 p-4">
              <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted">
                Constituents
              </p>
              <div className="space-y-3">
                {tpa1Basket.constituents.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-mono text-sm">{item.symbol}</span>
                    <AddressDisplay value={item.address} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Kicker className="mb-4">Developer</Kicker>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          <GuideLink
            title="Official SDK"
            body="Use the deployment-pinned SDK revision, not current master, against these recorded testnet addresses."
            href={officialSources.sdk}
            external
          />
          <GuideLink
            title="Contract integration"
            body="Ordinary user actions go through a single address: StaticsDiamond."
            href={officialSources.integration}
            external
          />
          <GuideLink
            title="Mint TPA1"
            body="Quote, exact approvals, simulation, and mint against the recorded testnet Diamond."
            href="/interact"
          />
          <GuideLink
            title="PositionNFT"
            body="StaticsDiamond is also the PositionNFT contract. Inspect IDs with the deployed ABI views."
            href="/position"
          />
          <GuideLink
            title="Deployment reference"
            body={`This app pins SDK commit ${staticsDeployment.sdkCommit.slice(0, 12)} and the recorded integration-beta addresses.`}
            href={officialSources.deployment}
            external
          />
        </div>
      </section>
    </AppShell>
  );
}

function GuideLink({
  title,
  body,
  href,
  external,
}: {
  title: string;
  body: string;
  href: string;
  external?: boolean;
}) {
  const className =
    "block bg-panel p-5 transition-colors hover:bg-panel-2 sm:p-6";
  const content = (
    <>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
