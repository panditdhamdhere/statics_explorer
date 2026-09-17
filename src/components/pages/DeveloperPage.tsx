"use client";

import { AppShell } from "@/components/AppShell";
import { CodeBlock } from "@/components/CodeBlock";
import { officialSources, PINNED_SDK_COMMIT, PINNED_SDK_INSTALL } from "@/config/sources";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import { pinnedSdk } from "@/lib/staticsSdk";

const networkSetup = `import { defineChain } from "viem";

export const robinhoodChainTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL!] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});`;

const installSdk = PINNED_SDK_INSTALL;

const readBasket = `import { createPublicClient, http } from "viem";
import { staticsAbi, basketTokenAbi } from "@statics-protocol/sdk";

const client = createPublicClient({
  chain: robinhoodChainTestnet,
  transport: http(process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL),
});

const diamond = "${staticsDeployment.contracts.staticsDiamond.address}";
const tpa1 = "${tpa1Basket.token}";

const basket = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "basket",
  args: [0n],
});

const supply = await client.readContract({
  address: tpa1,
  abi: basketTokenAbi,
  functionName: "totalSupply",
});`;

const mintFlow = `Wallet
↓
SDK quoteMint / buildMintCall
↓
StaticsDiamond
↓
simulateContract
↓
exact ERC-20 approve (if required)
↓
mint(basketId, shares, receiver, maxAmountsIn)
↓
waitForTransactionReceipt
↓
Re-read ERC-20 balances`;

const quoteAndMint = `import { buildMintCall, staticsAbi, basketTokenAbi } from "@statics-protocol/sdk";

const quoted = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "quoteMint",
  args: [0n, shares],
});

for (const [index, asset] of assets.entries()) {
  const allowance = await client.readContract({
    address: asset,
    abi: basketTokenAbi,
    functionName: "allowance",
    args: [account, diamond],
  });
  if (allowance < quoted[index]) {
    await walletClient.sendTransaction({
      to: asset,
      data: encodeFunctionData({
        abi: basketTokenAbi,
        functionName: "approve",
        args: [diamond, quoted[index]],
      }),
    });
  }
}

await client.simulateContract({
  account,
  address: diamond,
  abi: staticsAbi,
  functionName: "mint",
  args: [0n, shares, account, quoted],
});

const hash = await walletClient.sendTransaction({
  to: diamond,
  data: buildMintCall(0n, shares, account, quoted),
});
await client.waitForTransactionReceipt({ hash });`;

const faucetClaim = `import { buildTestnetFaucetClaimCall } from "@statics-protocol/sdk";

const data = buildTestnetFaucetClaimCall();
const hash = await walletClient.sendTransaction({
  to: "${staticsDeployment.contracts.staticsFaucet.address}",
  data,
});`;

const readPosition = `import { staticsAbi } from "@statics-protocol/sdk";

const positionId = 1n;

const state = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "positionState",
  args: [positionId],
});

if (!state.exists) {
  throw new Error("Unable to read a position for this ID on the selected deployment.");
}

const owner = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "ownerOf",
  args: [positionId],
});

const stake = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "stakePosition",
  args: [positionId],
});`;

export function DeveloperPage() {
  return (
    <AppShell
      kicker="Developer"
      title="Developer integration"
      description="How this explorer reads the recorded Robinhood Chain Testnet integration-beta and how the Interact page prepares, simulates, and submits a TPA1 mint."
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">1. Network setup</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Target Robinhood Chain Testnet, chain ID 46630. Provide the RPC through
            NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL. Do not silently substitute an
            unverified endpoint. The official public RPC is documented by Robinhood
            Chain at the connecting guide.
          </p>
          <CodeBlock label="viem chain" code={networkSetup} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">2. Install SDK</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Install from GitHub, not the npm registry, and pin the deployment
            revision.
          </p>
          <CodeBlock label="install" code={installSdk} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">3. Deployment compatibility</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Official docs distinguish the deployment-pinned SDK (
            {PINNED_SDK_COMMIT}) from current statics master. Current master includes
            Operators launch/vesting, redrawable Genesis credit, and permissionless
            general-pool APIs that are not deployed at these addresses.
          </p>
          <p className="text-sm leading-6 text-zinc-400">
            The SDK export <code>robinhoodChain</code> reports chainId{" "}
            {pinnedSdk.robinhoodChainBinding.chainId} and is generated from
            deployments/robinhood-chain-4663.json. It is a v4 infrastructure binding,
            not the Statics testnet address map. Use the recorded testnet deployment
            snapshot for StaticsDiamond, USDstx, TPA1, and related contracts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">4. Read-only contract access</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Overview, Basket, Contracts, and PositionNFT remain read-only. They use
            verified view methods from <code>staticsAbi</code> and{" "}
            <code>basketTokenAbi</code>. Wallet connection is optional for those pages.
          </p>
          <CodeBlock label="read TPA1" code={readBasket} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">5. TPA1 metadata</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
            <li>Basket ID 0 · Tesla-Palantir-AMD-1 · TPA1</li>
            <li>Basket token {tpa1Basket.token}</li>
            <li>
              Documented testnet fixture composition: 0.01 TSLA, 0.01 PLTR, 0.01 AMD
              per BasketToken. This is not a production composition.
            </li>
            <li>
              Live composition, if available, comes from basket(0).bundleAmounts.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">6. PositionNFT inspection</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Use <code>positionState</code>, <code>ownerOf</code>,{" "}
            <code>stakePosition</code>, <code>positionPortfolioCounts</code>, and
            related views from the pinned ABI.{" "}
            <code>decodePositionInfo</code> in the SDK decodes Uniswap v4
            PositionManager packed ticks, not Statics PositionNFT state. Wallet
            <code>mint()</code> of TPA1 does not create a PositionNFT.
          </p>
          <CodeBlock label="read PositionNFT" code={readPosition} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">7. How this integration works</h2>
          <p className="text-sm leading-6 text-zinc-400">
            The Interact page is an independent proof-of-concept for a documented
            testnet action. It is not an official Statics product.
          </p>
          <CodeBlock label="flow" code={mintFlow} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">8. Transaction preparation</h2>
          <p className="text-sm leading-6 text-zinc-400">
            The app reads live <code>quoteMint(0, shares)</code> from StaticsDiamond.
            That quote is the maxAmountsIn vector. The local SDK helper{" "}
            <code>quoteMint(snapshot, shares)</code> is not used as the submission
            quote because onchain quotes remain authoritative.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">9. Approvals</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Each constituent is approved to StaticsDiamond for the exact quoted
            amount. Unlimited approvals are not used. If allowance is already
            sufficient, that approve step is skipped. Allowance is re-read after
            each receipt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">10. Simulation and gas</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Every step is simulated with <code>simulateContract</code> before the
            wallet prompt. If simulation reverts, the app does not send the
            transaction. Gas is estimated from the simulation request or{" "}
            <code>estimateContractGas</code>, then multiplied by the current gas
            price. Failed estimates are shown as unavailable, not invented.
          </p>
          <CodeBlock label="quote, approve, simulate, mint" code={quoteAndMint} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">11. Submission, receipt, and refresh</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Calldata for mint is encoded with <code>buildMintCall</code>. The wallet
            sends the transaction, then the app waits for the receipt. Success is
            shown only after <code>receipt.status === &quot;success&quot;</code>.
            Wallet ERC-20 balances are then re-read and compared with the pre-tx
            snapshot.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">12. Faucet</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Testnet fixtures are claimed with the documented faucet{" "}
            <code>claim()</code> selector via <code>buildTestnetFaucetClaimCall()</code>.
            Cooldown and inventory are read from the live faucet contract.
          </p>
          <CodeBlock label="faucet claim" code={faucetClaim} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">13. Important integration safety rules</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
            <li>Use the deployment-pinned SDK for the recorded testnet.</li>
            <li>
              Do not use current master-only APIs against older deployed addresses.
            </li>
            <li>Read active chain addresses and parameters from the live Diamond.</li>
            <li>
              Quote immediately before value-moving transactions. Onchain quotes remain
              authoritative.
            </li>
            <li>
              Use explicit minimums and maximums for value-moving calls.
            </li>
            <li>Scope approvals to intended actions.</li>
            <li>Test against testnet before production.</li>
            <li>
              If an SDK helper is not in this pinned revision, see the
              deployment-pinned SDK types for the exact method signature. Do not
              assume a master-only export exists on these addresses.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">14. Source links</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(officialSources).map(([key, href]) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 underline underline-offset-4"
                >
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
