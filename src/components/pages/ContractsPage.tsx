"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Input } from "@/components/ui/input";
import {
  additionalVerifiedContracts,
  directoryContracts,
} from "@/config/staticsDeployment";
import { explorerAddressUrl } from "@/lib/explorer";

export function ContractsPage() {
  const [query, setQuery] = useState("");

  const primary = useMemo(
    () => filterContracts(directoryContracts, query),
    [query],
  );
  const additional = useMemo(
    () => filterContracts(additionalVerifiedContracts, query),
    [query],
  );

  return (
    <AppShell
      kicker="Contracts"
      title="Contract directory"
      description="Verified addresses from the recorded Robinhood Chain Testnet integration-beta deployment. These are not mainnet addresses."
    >
      <div className="mb-6 max-w-md">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, symbol, category, or address"
        />
      </div>

      <ContractTable title="Core deployment contracts" rows={primary} />
      <div className="mt-10">
        <ContractTable
          title="Additional verified deployment records"
          rows={additional}
        />
      </div>
    </AppShell>
  );
}

function filterContracts(
  rows: typeof directoryContracts,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    [row.name, row.symbol ?? "", row.category, row.address]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

function ContractTable({
  title,
  rows,
}: {
  title: string;
  rows: typeof directoryContracts;
}) {
  return (
    <section>
      <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Contract</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Explorer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.name}-${row.address}`} className="border-t border-zinc-800">
                <td className="px-4 py-3">
                  <div>{row.name}</div>
                  {row.symbol ? (
                    <div className="font-mono text-xs text-zinc-500">{row.symbol}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <AddressDisplay value={row.address} explorer={false} />
                </td>
                <td className="px-4 py-3 text-zinc-400">{row.category}</td>
                <td className="px-4 py-3">
                  <a
                    href={explorerAddressUrl(row.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-200 underline underline-offset-4"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No contracts match this search.</p>
      ) : null}
    </section>
  );
}
