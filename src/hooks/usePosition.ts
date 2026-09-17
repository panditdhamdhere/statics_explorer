"use client";

import { useMutation } from "@tanstack/react-query";
import { isRpcConfigured } from "@/config/network";
import { readPosition, type PositionReadResult } from "@/lib/protocolReads";

export function usePosition() {
  const rpcConfigured = isRpcConfigured();

  const mutation = useMutation({
    mutationFn: async (rawId: string): Promise<PositionReadResult> => {
      if (!rpcConfigured) {
        return {
          status: "invalid",
          message:
            "Set NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL before reading a PositionNFT.",
        };
      }
      return readPosition(rawId);
    },
  });

  return {
    rpcConfigured,
    result: mutation.data,
    status: mutation.isPending
      ? ("loading" as const)
      : mutation.isError
        ? ("error" as const)
        : mutation.data
          ? ("success" as const)
          : ("idle" as const),
    error: mutation.error,
    read: mutation.mutate,
    reset: mutation.reset,
  };
}
