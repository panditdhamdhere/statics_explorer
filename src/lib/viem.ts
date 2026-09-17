import { createPublicClient, http, type PublicClient } from "viem";
import {
  getConfiguredRpcUrl,
  robinhoodChainTestnet,
} from "@/config/network";

let cachedClient: PublicClient | null = null;
let cachedRpc: string | undefined;

export function getPublicClient(): PublicClient | null {
  const rpcUrl = getConfiguredRpcUrl();
  if (!rpcUrl) return null;

  if (cachedClient && cachedRpc === rpcUrl) return cachedClient;

  cachedRpc = rpcUrl;
  cachedClient = createPublicClient({
    chain: robinhoodChainTestnet,
    transport: http(rpcUrl, {
      timeout: 20_000,
      retryCount: 2,
    }),
  });

  return cachedClient;
}
