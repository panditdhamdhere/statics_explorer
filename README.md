# Statics Explorer

Explorer and testnet client for [Statics Protocol](https://docs.staticsprotocol.com/docs/introduction/) on Robinhood Chain Testnet (chain ID `46630`).

Read TPA1 and PositionNFTs, then mint TPA1 through StaticsDiamond.

## Stack

Next.js App Router, TypeScript, Tailwind, viem, wagmi. SDK is pinned to `135b68b8c404a1f567ae834c2e46e517e5788e28` and vendored at `vendor/statics-sdk`.

## Testnet

| | |
| --- | --- |
| Network | Robinhood Chain Testnet |
| Chain ID | `46630` |
| Explorer | https://explorer.testnet.chain.robinhood.com |
| StaticsDiamond | `0x2340741Ec94dF12678312f564eBc2c776d8FaA6a` |
| TPA1 | `0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83` |
| Faucet | `0xDc74E592efbe3CE5A86785E89E50b53Fe0F8F04E` |

TPA1 composition on this network is 0.01 TSLA / 0.01 PLTR / 0.01 AMD.

The SDK export `robinhoodChain` is chain `4663` (Robinhood v4). This app uses the testnet addresses above on `46630`.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL` | For live reads and minting | Testnet JSON-RPC |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | Adds WalletConnect next to injected wallets |

Public RPC: `https://rpc.testnet.chain.robinhood.com` ([docs](https://docs.robinhood.com/chain/connecting/)).

## Mint path

`quoteMint` → exact ERC-20 `approve` to StaticsDiamond → `simulateContract` → `mint` → receipt → re-read balances.

Minting TPA1 does not create a PositionNFT. Look those up on `/position`.

## Deploy

Import the repo into Vercel. Set `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL`. Optionally set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. `postinstall` compiles the vendored SDK.

## Docs

- https://docs.staticsprotocol.com/docs/reference/robinhood-testnet-deployment/
- https://docs.staticsprotocol.com/docs/reference/sdk/
- https://github.com/EqualFiLabs/statics-sdk
- `docs/tutorial.md`

```bash
npm run lint
npm run typecheck
npm run build
```
