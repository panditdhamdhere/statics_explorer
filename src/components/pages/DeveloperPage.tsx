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
  throw new Error("No position at this ID.");
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
      title="Integration notes"
      description="How this app talks to Statics on Robinhood Chain Testnet."
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">1. Network setup</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Use Robinhood Chain Testnet (46630). Set
            NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL. Public RPC:
            https://rpc.testnet.chain.robinhood.com
          </p>
          <CodeBlock label="viem chain" code={networkSetup} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">2. Install SDK</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Install from GitHub and pin commit {PINNED_SDK_COMMIT}. Current
            statics master includes APIs that are not on this Diamond.
          </p>
          <CodeBlock label="install" code={installSdk} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">3. SDK pin</h2>
          <p className="text-sm leading-6 text-zinc-400">
            This repo vendors {PINNED_SDK_COMMIT}.{" "}
            <code>robinhoodChain</code> is chain{" "}
            {pinnedSdk.robinhoodChainBinding.chainId} (Robinhood v4), not Statics
            testnet 46630. Contract addresses come from the testnet deployment
            docs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">4. Reads</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Overview, Basket, Contracts, and PositionNFT are read-only and use{" "}
            <code>staticsAbi</code> / <code>basketTokenAbi</code>.
          </p>
          <CodeBlock label="read TPA1" code={readBasket} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">5. TPA1 metadata</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
            <li>Basket ID 0 · Tesla-Palantir-AMD-1 · TPA1</li>
            <li>Basket token {tpa1Basket.token}</li>
            <li>
              Documented composition: 0.01 TSLA, 0.01 PLTR, 0.01 AMD per TPA1.
            </li>
            <li>
              Live composition, if available, comes from basket(0).bundleAmounts.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">6. PositionNFT inspection</h2>
          <p className="text-sm leading-6 text-zinc-400">
            PositionNFT views live on the Diamond.{" "}
            <code>decodePositionInfo</code> is a Uniswap v4 helper, not a Statics
            decoder. Minting TPA1 does not mint a PositionNFT.
          </p>
          <CodeBlock label="read PositionNFT" code={readPosition} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">7. Mint flow</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Interact quotes onchain, approves exact amounts, simulates, then mints.
          </p>
          <CodeBlock label="flow" code={mintFlow} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">8. Transaction preparation</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Interact uses live <code>quoteMint(0, shares)</code> as{" "}
            <code>maxAmountsIn</code>. The off-chain SDK helper is not the submit
            quote.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">9. Approvals</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Constituents are approved to StaticsDiamond for the quoted amount.
            Existing allowance skips approve.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">10. Simulation and gas</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Each step is simulated with <code>simulateContract</code> before the
            wallet prompt. Reverts are not sent.
          </p>
          <CodeBlock label="quote, approve, simulate, mint" code={quoteAndMint} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">11. Submission, receipt, and refresh</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Mint calldata comes from <code>buildMintCall</code>. Success waits for{" "}
            <code>receipt.status === &quot;success&quot;</code>, then re-reads
            balances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">12. Faucet</h2>
          <p className="text-sm leading-6 text-zinc-400">
            Claim with <code>buildTestnetFaucetClaimCall()</code>. Cooldown is
            onchain.
          </p>
          <CodeBlock label="faucet claim" code={faucetClaim} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">13. Notes</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
            <li>Pin the SDK to this testnet revision.</li>
            <li>Read parameters from the live Diamond.</li>
            <li>Quote immediately before mint.</li>
            <li>Approve only the quoted amount.</li>
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
