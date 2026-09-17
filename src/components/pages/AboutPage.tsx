import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { officialSources } from "@/config/sources";
import { staticsDeployment } from "@/config/staticsDeployment";

export function AboutPage() {
  return (
    <AppShell
      kicker="About"
      title="About Statics Explorer"
      description="An independent developer explorer and testnet integration for the recorded Statics Protocol Robinhood Chain Testnet integration-beta deployment."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-400">
            <p>
              Built as an independent developer integration proof-of-concept for
              Statics Protocol. It is not an official Statics product, is not
              endorsed by Statics, and is not production-ready.
            </p>
            <p>
              The explorer demonstrates a deployment-compatible SDK pin, verified
              testnet addresses, read-only contract access, and a documented TPA1
              mint on Interact. Approvals are exact amounts to StaticsDiamond.
              This is testnet only.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recorded deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Network" value={staticsDeployment.network} />
            <Row label="Chain ID" value={String(staticsDeployment.chainId)} />
            <Row label="Label" value={staticsDeployment.label} />
            <Row
              label="SDK commit"
              value={staticsDeployment.sdkCommit}
            />
            <Row
              label="Release start block"
              value={String(staticsDeployment.release.releaseStartBlock)}
            />
            <Row
              label="Protocol-pools upgrade block"
              value={String(staticsDeployment.release.governedProtocolPoolsUpgradeBlock)}
            />
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500">StaticsDiamond</span>
              <AddressDisplay value={staticsDeployment.contracts.staticsDiamond.address} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Not production</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-400">
            <p>
              This deployment is an integration beta. Official docs state that
              production must replace mock USDG and oracle fixtures, choose a
              reviewed staking-token policy, verify governance delay, select
              production roles, and qualify a single exact release revision.
            </p>
            <p>
              Public basket creation stays protocol-only on this deployment. The
              faucet, mock USDG, mock oracles, and owner-mintable STATICS token
              are testnet fixtures.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Official sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.values(officialSources).map((href) => (
              <div key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 underline underline-offset-4"
                >
                  {href}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="break-all font-mono text-zinc-100">{value}</span>
    </div>
  );
}
