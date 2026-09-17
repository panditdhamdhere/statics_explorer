"use client";

import { useQuery } from "@tanstack/react-query";
import { isRpcConfigured } from "@/config/network";
import { getPublicClient } from "@/lib/viem";

export function useRpcHealth() {
  const rpcConfigured = isRpcConfigured();
  const query = useQuery({
    queryKey: ["statics", "rpc-health"],
    queryFn: async () => {
      const client = getPublicClient();
      if (!client) throw new Error("RPC URL is not configured.");
      const blockNumber = await client.getBlockNumber();
      return { blockNumber };
    },
    enabled: rpcConfigured,
    refetchInterval: 20_000,
  });

  return {
    rpcConfigured,
    live: rpcConfigured && query.isSuccess,
    unavailable: !rpcConfigured || query.isError,
    checking: rpcConfigured && query.isPending,
    blockNumber: query.data?.blockNumber,
    error: query.error,
    refetch: query.refetch,
  };
}
