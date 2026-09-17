import { defineChain } from "viem";

/**
 * Official Robinhood Chain Testnet public RPC, documented at:
 * https://docs.robinhood.com/chain/connecting/
 *
 * The explorer never uses this as a silent fallback for app reads.
 * Set NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL to enable live contract reads.
 */
export const DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL =
  "https://rpc.testnet.chain.robinhood.com";

export const ROBINHOOD_TESTNET_EXPLORER_URL =
  "https://explorer.testnet.chain.robinhood.com";

export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;

export const ROBINHOOD_TESTNET_NAME = "Robinhood Chain Testnet";

export const DEPLOYMENT_LABEL = "Robinhood Chain Testnet · Integration Beta";

export function getConfiguredRpcUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL?.trim();
  return value ? value : undefined;
}

export function isRpcConfigured(): boolean {
  return Boolean(getConfiguredRpcUrl());
}

export function getWalletConnectProjectId(): string | undefined {
  const value = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
  return value ? value : undefined;
}

export const robinhoodChainTestnet = defineChain({
  id: ROBINHOOD_TESTNET_CHAIN_ID,
  name: ROBINHOOD_TESTNET_NAME,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [getConfiguredRpcUrl() ?? DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: ROBINHOOD_TESTNET_EXPLORER_URL,
    },
  },
  testnet: true,
});
