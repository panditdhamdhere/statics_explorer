# Statics Integration Explorer

A developer-focused explorer and testnet integration for Statics Protocol's recorded Robinhood Chain Testnet integration-beta deployment.

Built as an independent developer integration proof-of-concept for Statics Protocol.

This is **not** an official Statics product, is **not** endorsed by Statics, and is **not** production-ready.

## What this demonstrates

- Real Statics SDK integration, pinned to the recorded deployment revision
- Robinhood Chain Testnet (chain ID `46630`) reads and writes
- A real transaction lifecycle: quote → simulate → exact approvals → mint → receipt → state refresh
- Testnet contract interaction against `StaticsDiamond`
- Post-transaction ERC-20 balance verification
- PositionNFT inspection of the same Diamond (separate from the mint flow)

## Why this project exists

Statics is integrated through a single Diamond address that is also the PositionNFT contract. Integrators need a concrete, deployment-accurate reference for:

- the recorded Robinhood Chain Testnet addresses
- the deployment-pinned SDK revision
- read-only inspection of TPA1 and PositionNFTs
- a documented testnet mint of TPA1 with exact approvals and simulation

## Features

- Overview of the recorded testnet deployment
- TPA1 genesis basket explorer
- Interact: faucet claim (documented) and TPA1 mint
- PositionNFT inspector using verified Diamond view methods
- Searchable contract directory
- Developer notes that match this repository's implementation
- Wallet connect / wrong-network detection
- Live testnet indicator from the configured RPC

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- viem
- wagmi
- `@statics-protocol/sdk` pinned to `135b68b8c404a1f567ae834c2e46e517e5788e28`

## Architecture

```
Connect wallet (optional for reads, required for Interact)
        ↓
Public RPC reads  ──  Overview / Basket / PositionNFT / Contracts
        ↓
Interact
  quoteMint(0, shares) on StaticsDiamond
        ↓
  exact ERC-20 approve(TSLA|PLTR|AMD → Diamond) if allowance is insufficient
        ↓
  simulateContract
        ↓
  wallet confirmation
        ↓
  mint(basketId, shares, receiver, maxAmountsIn)
        ↓
  waitForTransactionReceipt
        ↓
  re-read wallet balances
```

Static verified metadata, live chain reads, SDK integration, and UI stay separate. Page files are thin route wrappers.

## Testnet

This app targets the **integration-beta** deployment on Robinhood Chain Testnet. It is not a production dashboard.

| Field | Value |
| --- | --- |
| Network | Robinhood Chain Testnet |
| Label | Robinhood Chain Testnet · Integration Beta |
| Chain ID | `46630` |
| Explorer | https://explorer.testnet.chain.robinhood.com |
| StaticsDiamond | `0x2340741Ec94dF12678312f564eBc2c776d8FaA6a` |
| TPA1 | `0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83` |
| Faucet | `0xDc74E592efbe3CE5A86785E89E50b53Fe0F8F04E` |
| Deployment-pinned SDK | `135b68b8c404a1f567ae834c2e46e517e5788e28` |

These testnet addresses are **not** mainnet addresses.

TPA1's 0.01 / 0.01 / 0.01 composition is a **documented testnet fixture**, not a production basket.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is taken, Next.js will choose the next one (this repo often serves on `3001`).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL` | Yes, for live reads and Interact | Robinhood Chain Testnet JSON-RPC endpoint |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | WalletConnect Cloud project ID. When set, Connect wallet offers WalletConnect (QR / mobile) in addition to injected browser wallets |

If the RPC URL is missing, verified deployment metadata still renders and the UI shows that the testnet connection is unavailable. The app does not fall back to fake protocol data.

Official public RPC documented by Robinhood Chain:

`https://rpc.testnet.chain.robinhood.com`

Source: [Connecting to Robinhood Chain](https://docs.robinhood.com/chain/connecting/)

## Security

- Testnet only. Do not point this UI at production addresses.
- No private keys or seed phrases are stored.
- The app never switches networks silently.
- ERC-20 approvals are exact quoted amounts to StaticsDiamond, never unlimited.
- A transaction is not sent if `simulateContract` reverts.
- Success is shown only after a confirmed receipt with `status === "success"`.

## Deployment compatibility warning

Official Statics docs distinguish two SDK revisions:

- Recorded Robinhood testnet deployment: `135b68b8c404a1f567ae834c2e46e517e5788e28`
- Current `statics` master, which includes APIs that are **not** deployed at the recorded testnet addresses

This app pins the deployment revision. Do not use current master-only APIs against these older addresses.

The SDK export `robinhoodChain` is generated from `deployments/robinhood-chain-4663.json` and reports chain ID **4663**. It is a Robinhood v4 infrastructure binding, not the Statics testnet deployment map.

## How the SDK is used

The GitHub package gitignores `dist/`, so this repo vendors the pinned SDK source at `vendor/statics-sdk` (commit `135b68b8c404a1f567ae834c2e46e517e5788e28`) and `scripts/build-statics-sdk.mjs` compiles it after install.

Verified exports used by this app include:

- `staticsAbi`
- `basketTokenAbi`
- `staticsTestnetFaucetAbi`
- `staticsBasketErrorAbi`
- `buildMintCall`
- `buildTestnetFaucetClaimCall`
- `allowsExposureIncrease`
- `SHARE_SCALE`
- `BasketStatus`
- `robinhoodChain` (documented as a 4663 v4 binding, not used as the testnet Statics address map)

## Limitations

- Live reads and Interact require a configured RPC. Public RPCs may be rate-limited.
- Some Diamond views may be unavailable if a selector is not routed on this deployment.
- Wallet `mint()` of TPA1 delivers BasketToken to the wallet. It does **not** create a PositionNFT.
- `createAndMintBasketCollateral` and PositionNFT staking flows are documented but not implemented here.
- Faucet claims are limited by the onchain one-day cooldown.
- No TVL, APY, price, or volume cards are shown.

## Vercel

1. Import the repository into Vercel.
2. Set `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL` to a Robinhood Chain Testnet RPC.
3. Optional: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
4. Deploy. The postinstall script compiles the vendored SDK.

Use a dedicated RPC if the public endpoint is rate-limited.

## Official sources

- https://docs.staticsprotocol.com/docs/introduction/
- https://docs.staticsprotocol.com/docs/reference/robinhood-testnet-deployment/
- https://docs.staticsprotocol.com/docs/reference/sdk/
- https://docs.staticsprotocol.com/docs/reference/integration/
- https://docs.staticsprotocol.com/docs/start/testnet-onboarding/
- https://github.com/EqualFiLabs/statics-sdk
- https://docs.robinhood.com/chain/connecting/

See `docs/tutorial.md` for the integration walkthrough that matches this codebase.

## Commands

```bash
npm install
npm run lint
npm run typecheck
npm run build
```
