"use client";

import { useQuery } from "@tanstack/react-query";
import { isRpcConfigured } from "@/config/network";
import { tpa1Basket } from "@/config/staticsDeployment";
import { readTpa1Live } from "@/lib/protocolReads";

export function useTpa1() {
  const rpcConfigured = isRpcConfigured();

  const query = useQuery({
    queryKey: ["statics", "tpa1", tpa1Basket.token],
    queryFn: readTpa1Live,
    enabled: rpcConfigured,
  });

  return {
    rpcConfigured,
    metadata: tpa1Basket,
    live: query.data,
    status: !rpcConfigured
      ? ("unconfigured" as const)
      : query.isPending
        ? ("loading" as const)
        : query.isError
          ? ("error" as const)
          : ("success" as const),
    error: query.error,
    refetch: query.refetch,
  };
}
