# Statics on Robinhood Chain Testnet

Notes for this repo. Code lives under `src/`.

## Contracts

- StaticsDiamond / PositionNFT: `0x2340741Ec94dF12678312f564eBc2c776d8FaA6a`
- TPA1: `0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83`
- Faucet: `0xDc74E592efbe3CE5A86785E89E50b53Fe0F8F04E`

## SDK

Pin `135b68b8c404a1f567ae834c2e46e517e5788e28`. Current `statics` master has APIs that are not on this Diamond. Source is vendored at `vendor/statics-sdk`.

`robinhoodChain` is chain `4663`. Testnet addresses in this app are on `46630`.

## Network

Chain ID `46630`. RPC from `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL` only.

```ts
import { defineChain } from "viem";

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
});
```

## Wallet

Injected wallets always. WalletConnect if `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set. Interact needs an account on chain `46630`.

## TPA1

Basket ID `0`. Live config from `basket(0)` and `quoteMint`. Documented mix is 0.01 / 0.01 / 0.01.

```ts
const basket = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "basket",
  args: [0n],
});

const quoted = await client.readContract({
  address: diamond,
  abi: staticsAbi,
  functionName: "quoteMint",
  args: [0n, shares],
});
```

See `src/lib/protocolReads.ts` and `src/lib/tpa1Mint.ts`.

## Mint

1. Convert the TPA1 amount to shares (`SHARE_SCALE` for `1` TPA1).
2. Read balances and allowances vs StaticsDiamond.
3. Call onchain `quoteMint`.
4. Skip if the basket is not Active (`allowsExposureIncrease`).
5. Encode with `buildMintCall(basketId, shares, receiver, maxAmountsIn)`.

Submit the onchain quote. If `allowance < amountIn`, approve StaticsDiamond for that amount.

```ts
await publicClient.simulateContract({
  account,
  address: step.contract,
  abi,
  functionName: step.functionName,
  args: step.args,
});

const hash = await walletClient.sendTransaction({
  account,
  to: step.contract,
  data: step.calldata,
  chain: robinhoodChainTestnet,
});
```

Wait for `receipt.status === "success"`, then re-read balances. Faucet calldata is `buildTestnetFaucetClaimCall()`. See `src/lib/sendStaticsTx.ts`.

Minting TPA1 does not mint a PositionNFT. `/position` uses `positionState` and `ownerOf`. `decodePositionInfo` is Uniswap v4, not Statics.
