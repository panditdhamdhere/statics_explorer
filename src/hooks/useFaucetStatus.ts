"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { isRpcConfigured } from "@/config/network";
import { readFaucetStatus } from "@/lib/faucet";
import { getPublicClient } from "@/lib/viem";

export function useFaucetStatus(account?: Address) {
  const rpcConfigured = isRpcConfigured();
  const query = useQuery({
    queryKey: ["statics", "faucet", account],
    queryFn: async () => {
      const client = getPublicClient();
      if (!client) throw new Error("RPC URL is not configured.");
      return readFaucetStatus(client, account);
    },
    enabled: rpcConfigured,
  });

  return {
    status: query.data,
    error: query.error,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
