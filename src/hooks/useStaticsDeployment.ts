"use client";

import { useQuery } from "@tanstack/react-query";
import { isRpcConfigured } from "@/config/network";
import { staticsDeployment } from "@/config/staticsDeployment";
import { pinnedSdk } from "@/lib/staticsSdk";
import { readProtocolSnapshot } from "@/lib/protocolReads";

export function useStaticsDeployment() {
  const rpcConfigured = isRpcConfigured();

  const query = useQuery({
    queryKey: ["statics", "protocol-snapshot", staticsDeployment.sdkCommit],
    queryFn: readProtocolSnapshot,
    enabled: rpcConfigured,
  });

  return {
    rpcConfigured,
    deployment: staticsDeployment,
    sdk: pinnedSdk,
    snapshot: query.data,
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
