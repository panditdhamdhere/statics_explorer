# Building a Statics Protocol Integration on Robinhood Chain Testnet

This tutorial describes the Statics Integration Explorer in this repository. The snippets match the implementation under `src/`.

This project is an independent integration proof-of-concept. It is not an official Statics product.

## 1. What we built

A Next.js explorer that:

- reads the recorded Robinhood Chain Testnet integration-beta
- inspects TPA1 and PositionNFTs with the deployment-pinned SDK
- prepares and submits one documented testnet action: **mint TPA1**
- optionally claims the documented testnet faucet so a wallet can obtain TSLA, PLTR, and AMD

Primary contracts:

- StaticsDiamond / PositionNFT: `0x2340741Ec94dF12678312f564eBc2c776d8FaA6a`
- TPA1: `0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83`
- Faucet: `0xDc74E592efbe3CE5A86785E89E50b53Fe0F8F04E`

## 2. Why the deployment-pinned SDK matters

Official docs distinguish:

- recorded testnet / vendored ABI revision `135b68b8c404a1f567ae834c2e46e517e5788e28`
- current `statics` master, which includes Operators, redrawable Genesis credit, and permissionless general-pool APIs that are **not** on these addresses

This app vendors that commit at `vendor/statics-sdk` and compiles it in `postinstall`. Do not call master-only helpers against the recorded Diamond.

The SDK export `robinhoodChain` reports chain ID `4663`. That binding is v4 infrastructure, not the Statics testnet address map. Testnet addresses in this app come from the official deployment snapshot.

## 3. Network setup

Target Robinhood Chain Testnet, chain ID `46630`. The RPC is taken only from `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL`. The explorer does not silently substitute another endpoint.

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

## 4. Wallet connection

Injected wallets are configured with wagmi. Reads work without a wallet. Interact requires:

- a connected account
- chain ID `46630`

The UI can prompt a switch. It does not change networks silently.

## 5. Reading TPA1

TPA1 is basket ID `0`. Live configuration comes from `basket(0)` and `quoteMint`. The 0.01 / 0.01 / 0.01 mix is the documented testnet fixture composition, not a live market weight.

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

Implemented in `src/lib/protocolReads.ts` and `src/lib/tpa1Mint.ts`.

## 6. Preparing the transaction

The Interact page converts a TPA1 amount with 18 decimals into shares (`SHARE_SCALE` for `1` TPA1). It then:

1. reads wallet balances and allowances against StaticsDiamond
2. calls onchain `quoteMint`
3. rejects the flow if the basket is not Active (`allowsExposureIncrease`)
4. builds calldata with `buildMintCall(basketId, shares, receiver, maxAmountsIn)`

Onchain quotes are used for submission. The off-chain SDK helper `quoteMint(snapshot, shares)` is not used as the sent vector.

## 7. Approval handling

For each constituent in the quote, if `allowance < amountIn`, the app adds an `approve(StaticsDiamond, amountIn)` step. The spender is always StaticsDiamond. Amounts are exact. Unlimited approvals are not used. After each approval receipt, balances and allowances are re-read.

## 8. Simulation

Every step is simulated before the wallet prompt:

```ts
await publicClient.simulateContract({
  account,
  address: step.contract,
  abi,
  functionName: step.functionName,
  args: step.args,
});
```

If simulation reverts, the transaction is not sent. Revert data is decoded with `staticsBasketErrorAbi` and ERC-20 insufficient-allowance / insufficient-balance errors when possible.

Implemented in `src/lib/sendStaticsTx.ts` and `src/lib/txErrors.ts`.

## 9. Transaction submission

After a passing simulation, the wallet sends the prepared calldata:

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: step.contract,
  data: step.calldata,
  chain: robinhoodChainTestnet,
});
```

Mint calldata is `buildMintCall(...)`. Faucet calldata is `buildTestnetFaucetClaimCall()`.

## 10. Confirmation

The app waits for the receipt and treats the action as successful only when `receipt.status === "success"`. Pending / submitted / confirming states are shown before that. A user rejection is reported as rejected, not as a protocol failure.

## 11. Reading resulting state

After confirmation the app re-reads wallet ERC-20 balances for TSLA, PLTR, AMD, TPA1, USDstx, STATICS, and mUSDG, then shows before → after. Those values are chain reads, not estimated mint amounts.

## 12. PositionNFT

`mint(basketId, shares, receiver, maxAmountsIn)` delivers TPA1 BasketToken to `receiver`. It does not mint a PositionNFT.

PositionNFT inspection remains on `/position` using `positionState`, `ownerOf`, and related Diamond views. `decodePositionInfo` is a Uniswap v4 tick decoder and is not used as a Statics PositionNFT decoder.

## 13. Error handling

The UI handles:

- missing RPC
- wallet not connected
- wrong network
- insufficient constituent balance
- insufficient allowance (approve first)
- simulation revert
- wallet rejection
- onchain reverted receipt
- faucet cooldown (`nextClaimAt`)

## 14. Security considerations

- Testnet only
- No private keys
- No silent network switch
- No unlimited approvals
- Quote immediately before mint
- Simulate before sign
- Confirm via receipt before showing success
