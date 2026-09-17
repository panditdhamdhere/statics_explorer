"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { isRpcConfigured } from "@/config/network";
import { TPA1_MINT_DIAMOND } from "@/lib/tpa1Mint";
import { getPublicClient } from "@/lib/viem";
import { readWalletAssetSnapshot } from "@/lib/walletAssets";

export function useWalletAssets(account?: Address) {
  const rpcConfigured = isRpcConfigured();
  const query = useQuery({
    queryKey: ["statics", "wallet-assets", account],
    queryFn: async () => {
      const client = getPublicClient();
      if (!client || !account) {
        throw new Error("RPC URL or wallet is not available.");
      }
      return readWalletAssetSnapshot(client, account, TPA1_MINT_DIAMOND);
    },
    enabled: rpcConfigured && Boolean(account),
  });

  return {
    snapshot: query.data,
    status: query.status,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
