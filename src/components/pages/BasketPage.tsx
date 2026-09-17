"use client";

import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staticsDeployment } from "@/config/staticsDeployment";
import { useTpa1 } from "@/hooks/useTpa1";
import { explorerTokenUrl } from "@/lib/explorer";
import { toUserErrorMessage } from "@/lib/errors";
import { checksumEquals, formatTokenAmount } from "@/lib/format";
import { getBasketStatusLabel } from "@/lib/staticsSdk";
import Link from "next/link";

export function BasketPage() {
  const { metadata, live, status, error, rpcConfigured } = useTpa1();

  return (
    <AppShell
      kicker="Basket"
      title="TPA1"
      description="Genesis basket on Robinhood Chain Testnet."
    >
      <div className="mb-8 rounded-2xl border border-line bg-panel px-5 py-4 text-sm leading-6 text-muted">
        Mint TPA1 from{" "}
        <Link href="/interact" className="text-foreground underline underline-offset-4">
          Interact
        </Link>
        .
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deployment</CardTitle>
              <span className="text-[10px] uppercase tracking-[0.14em] text-faint">
                deployment
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Name" value={metadata.name} />
            <Row label="Symbol" value={metadata.symbol} />
            <Row label="Basket ID" value={metadata.basketId.toString()} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500">Basket token</span>
              <AddressDisplay value={metadata.token} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Token explorer</span>
              <a
                href={explorerTokenUrl(metadata.token)}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 underline underline-offset-4"
              >
                Open token page
              </a>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500">StaticsDiamond</span>
              <AddressDisplay
                value={staticsDeployment.contracts.staticsDiamond.address}
              />
            </div>
            <Row label="Creator" value={metadata.creatorLabel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{metadata.documentedFixtureCompositionLabel}</CardTitle>
              <span className="text-[10px] uppercase tracking-[0.14em] text-faint">
                documentation
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-400">
              {metadata.documentedFixtureCompositionNote}
            </p>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 font-medium">Per BasketToken</th>
                  <th className="pb-2 font-medium">Asset</th>
                </tr>
              </thead>
              <tbody>
                {metadata.documentedFixtureComposition.map((row) => (
                  <tr key={row.symbol} className="border-t border-zinc-800">
                    <td className="py-2 font-mono">{row.amountPerBasketToken}</td>
                    <td className="py-2 font-mono">{row.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">Constituents</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Live name</th>
                <th className="px-4 py-3 font-medium">Vault balance</th>
              </tr>
            </thead>
            <tbody>
              {metadata.constituents.map((item, index) => {
                const token = live?.constituentTokens[index];
                const vault = live?.vaultBalances[index];
                return (
                  <tr key={item.symbol} className="border-t border-zinc-800">
                    <td className="px-4 py-3 font-mono">{item.symbol}</td>
                    <td className="px-4 py-3">
                      <AddressDisplay value={item.address} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {token?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-300">
                      {vault?.balance !== undefined && token?.decimals !== undefined
                        ? formatTokenAmount(vault.balance, token.decimals)
                        : vault?.balance !== undefined
                          ? vault.balance.toString()
                          : "Unavailable from current deployment/interface"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">Canonical pool IDs</h2>
        <div className="space-y-3">
          {metadata.canonicalPools.map((pool) => {
            const livePool = live?.canonicalPools.find(
              (entry) => entry.documented.pair === pool.pair,
            );
            const matches =
              livePool?.live?.poolId &&
              checksumEquals(livePool.live.poolId, pool.poolId);
            return (
              <Card key={pool.poolId}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-sm text-zinc-100">{pool.pair}</p>
                    {livePool?.live ? (
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        {matches ? "live poolId matches deployment" : "live poolId differs"}
                      </span>
                    ) : null}
                  </div>
                  <AddressDisplay value={pool.poolId} hex explorer={false} truncate={false} />
                  {livePool?.live ? (
                    <div className="grid gap-2 text-sm text-zinc-400 md:grid-cols-2">
                      <span>lpFee: {livePool.live.lpFee}</span>
                      <span>tickSpacing: {livePool.live.tickSpacing}</span>
                      <span>spotTick: {livePool.live.spotTick}</span>
                      <span>
                        decommissioned:{" "}
                        {livePool.protocol
                          ? String(livePool.protocol.decommissioned)
                          : "Unavailable from current deployment/interface"}
                      </span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">Live chain reads</h2>
        {!rpcConfigured ? (
          <p className="text-sm text-zinc-500">
            Live basket(), vaultBalance(), and canonicalPool() calls require an RPC URL.
          </p>
        ) : status === "loading" ? (
          <LoadingState title="Reading TPA1 from StaticsDiamond" />
        ) : status === "error" ? (
          <ErrorState
            detail={toUserErrorMessage(
              error,
              "RPC read failed.",
            )}
          />
        ) : live ? (
          <div className="grid gap-4 md:grid-cols-2">
            {live.token ? (
              <Card>
                <CardHeader>
                  <CardTitle>BasketToken ERC-20</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="name()" value={live.token.name ?? "Unavailable from current deployment/interface"} />
                  <Row label="symbol()" value={live.token.symbol ?? "Unavailable from current deployment/interface"} />
                  <Row
                    label="decimals()"
                    value={
                      live.token.decimals !== undefined
                        ? String(live.token.decimals)
                        : "Unavailable from current deployment/interface"
                    }
                  />
                  <Row
                    label="totalSupply()"
                    value={
                      live.token.totalSupply !== undefined && live.token.decimals !== undefined
                        ? formatTokenAmount(live.token.totalSupply, live.token.decimals)
                        : live.token.totalSupply?.toString() ??
                          "Unavailable from current deployment/interface"
                    }
                  />
                </CardContent>
              </Card>
            ) : null}
            {live.configuration ? (
              <Card>
                <CardHeader>
                  <CardTitle>basket(0)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="status" value={getBasketStatusLabel(live.configuration.status)} />
                  {live.basketStatus !== undefined ? (
                    <Row label="basketStatus()" value={getBasketStatusLabel(live.basketStatus)} />
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-zinc-500">token</span>
                    <AddressDisplay value={live.configuration.token} />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-zinc-500">creator</span>
                    <AddressDisplay value={live.configuration.creator} />
                  </div>
                  <Row label="flashFeeBps" value={String(live.configuration.flashFeeBps)} />
                  <Row label="originationFeeBps" value={String(live.configuration.originationFeeBps)} />
                  <Row label="extensionFeeBps" value={String(live.configuration.extensionFeeBps)} />
                  <Row label="ltvBps" value={String(live.configuration.ltvBps)} />
                  <Row label="recoveryPenaltyBps" value={String(live.configuration.recoveryPenaltyBps)} />
                  <Row label="loanDuration" value={String(live.configuration.loanDuration)} />
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-zinc-500">
                basket(0) is unavailable from the current deployment/interface.
              </p>
            )}
            {live.configuration ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Live bundle composition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-zinc-500">
                    Decoded from basket(0).bundleAmounts. Units are raw token amounts.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="pb-2 font-medium">Asset</th>
                          <th className="pb-2 font-medium">bundleAmount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {live.configuration.assets.map((asset, index) => {
                          const amount = live.configuration?.bundleAmounts[index];
                          const token = live.constituentTokens.find((item) =>
                            checksumEquals(item.address, asset),
                          );
                          return (
                            <tr key={`${asset}-${index}`} className="border-t border-zinc-800">
                              <td className="py-2">
                                <AddressDisplay value={asset} />
                              </td>
                              <td className="py-2 font-mono">
                                {amount === undefined
                                  ? "Unavailable from current deployment/interface"
                                  : token?.decimals !== undefined
                                    ? formatTokenAmount(amount, token.decimals)
                                    : amount.toString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {live.unavailable.length > 0 ? (
              <p className="text-xs text-zinc-500 md:col-span-2">
                Unavailable selectors: {live.unavailable.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-100">{value}</span>
    </div>
  );
}
