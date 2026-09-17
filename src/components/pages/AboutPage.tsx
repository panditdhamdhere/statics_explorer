import { AppShell } from "@/components/AppShell";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { officialSources } from "@/config/sources";
import { staticsDeployment } from "@/config/staticsDeployment";

export function AboutPage() {
  return (
    <AppShell
      kicker="About"
      title="About"
      description="Testnet explorer for Statics Protocol on Robinhood Chain."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-400">
            <p>
              A community explorer for the Statics integration-beta on Robinhood
              Chain Testnet. It is not affiliated with Statics.
            </p>
            <p>
              Reads run against the pinned SDK. Interact quotes, simulates, and
              mints TPA1 with exact ERC-20 approvals to StaticsDiamond.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Network" value={staticsDeployment.network} />
            <Row label="Chain ID" value={String(staticsDeployment.chainId)} />
            <Row label="SDK commit" value={staticsDeployment.sdkCommit} />
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
            <CardTitle>Docs</CardTitle>
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
