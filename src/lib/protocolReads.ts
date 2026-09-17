import { type PublicClient, type Address } from "viem";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import { UNAVAILABLE_FIELD, toUserErrorMessage } from "@/lib/errors";
import {
  POSITION_PORTFOLIO_MAX_PAGE_SIZE,
  basketTokenAbi,
  staticsAbi,
} from "@/lib/staticsSdk";
import { getPublicClient } from "@/lib/viem";
import type {
  BasketCollateralPosition,
  LiveBasketConfiguration,
  LiveCanonicalPool,
  LiveProtocolPool,
  LoanRecord,
  PortfolioCounts,
  PositionState,
  StakePosition,
  TokenMetadata,
} from "@/types/protocol";

export type ProtocolSnapshot = {
  name?: string;
  symbol?: string;
  basketCount?: bigint;
  nextPositionId?: bigint;
  positionCreationFee?: bigint;
  creationFee?: bigint;
  stakingToken?: Address;
  staticsDollar?: Address;
  staticsDollarRisk?: Address;
  weth?: Address;
  treasury?: Address;
  positionRenderer?: Address;
  totalStaked?: bigint;
  liquidityManager?: { manager: Address; installed: boolean };
  liquidityIntegration?: {
    poolManager: Address;
    hook: Address;
    installed: boolean;
  };
  unavailable: string[];
};

function clientOrThrow(): PublicClient {
  const client = getPublicClient();
  if (!client) {
    throw new Error(
      "NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL is not configured.",
    );
  }
  return client;
}

function markUnavailable(
  unavailable: string[],
  field: string,
  error: unknown,
) {
  unavailable.push(field);
  return toUserErrorMessage(
    error,
    `Unable to read ${field} on Robinhood Chain Testnet. Check the RPC configuration or try again.`,
  );
}

export async function readProtocolSnapshot(): Promise<ProtocolSnapshot> {
  const client = clientOrThrow();
  const address = staticsDeployment.contracts.staticsDiamond.address;
  const unavailable: string[] = [];

  async function read<T>(field: string, fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      markUnavailable(unavailable, field, error);
      return undefined;
    }
  }

  const [
    name,
    symbol,
    basketCount,
    nextPositionId,
    positionCreationFee,
    creationFee,
    stakingToken,
    staticsDollar,
    staticsDollarRisk,
    weth,
    treasury,
    positionRenderer,
    totalStaked,
    liquidityManager,
    liquidityIntegration,
  ] = await Promise.all([
    read("name", () =>
      client.readContract({ address, abi: staticsAbi, functionName: "name" }),
    ),
    read("symbol", () =>
      client.readContract({ address, abi: staticsAbi, functionName: "symbol" }),
    ),
    read("basketCount", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "basketCount",
      }),
    ),
    read("nextPositionId", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "nextPositionId",
      }),
    ),
    read("positionCreationFee", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "positionCreationFee",
      }),
    ),
    read("creationFee", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "creationFee",
      }),
    ),
    read("stakingToken", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "stakingToken",
      }),
    ),
    read("staticsDollar", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "staticsDollar",
      }),
    ),
    read("staticsDollarRisk", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "staticsDollarRisk",
      }),
    ),
    read("weth", () =>
      client.readContract({ address, abi: staticsAbi, functionName: "weth" }),
    ),
    read("treasury", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "treasury",
      }),
    ),
    read("positionRenderer", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "positionRenderer",
      }),
    ),
    read("totalStaked", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "totalStaked",
      }),
    ),
    read("liquidityManager", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "liquidityManager",
      }),
    ),
    read("liquidityIntegration", () =>
      client.readContract({
        address,
        abi: staticsAbi,
        functionName: "liquidityIntegration",
      }),
    ),
  ]);

  return {
    name,
    symbol,
    basketCount,
    nextPositionId,
    positionCreationFee,
    creationFee,
    stakingToken,
    staticsDollar,
    staticsDollarRisk,
    weth,
    treasury,
    positionRenderer,
    totalStaked,
    liquidityManager: liquidityManager
      ? { manager: liquidityManager[0], installed: liquidityManager[1] }
      : undefined,
    liquidityIntegration: liquidityIntegration
      ? {
          poolManager: liquidityIntegration[0],
          hook: liquidityIntegration[1],
          installed: liquidityIntegration[2],
        }
      : undefined,
    unavailable,
  };
}

export async function readTokenMetadata(
  token: Address,
): Promise<TokenMetadata> {
  const client = clientOrThrow();
  const [name, symbol, decimals, totalSupply] = await Promise.allSettled([
    client.readContract({
      address: token,
      abi: basketTokenAbi,
      functionName: "name",
    }),
    client.readContract({
      address: token,
      abi: basketTokenAbi,
      functionName: "symbol",
    }),
    client.readContract({
      address: token,
      abi: basketTokenAbi,
      functionName: "decimals",
    }),
    client.readContract({
      address: token,
      abi: basketTokenAbi,
      functionName: "totalSupply",
    }),
  ]);

  return {
    address: token,
    name: name.status === "fulfilled" ? name.value : undefined,
    symbol: symbol.status === "fulfilled" ? symbol.value : undefined,
    decimals: decimals.status === "fulfilled" ? decimals.value : undefined,
    totalSupply:
      totalSupply.status === "fulfilled" ? totalSupply.value : undefined,
  };
}

export async function readTpa1Live() {
  const client = clientOrThrow();
  const diamond = staticsDeployment.contracts.staticsDiamond.address;
  const unavailable: string[] = [];

  let configuration: LiveBasketConfiguration | undefined;
  try {
    const result = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "basket",
      args: [tpa1Basket.basketId],
    });
    configuration = {
      token: result.token,
      creator: result.creator,
      status: result.status,
      assets: result.assets,
      bundleAmounts: result.bundleAmounts,
      flashFeeBps: result.flashFeeBps,
      originationFeeBps: result.originationFeeBps,
      extensionFeeBps: result.extensionFeeBps,
      ltvBps: result.ltvBps,
      recoveryPenaltyBps: result.recoveryPenaltyBps,
      loanDuration: result.loanDuration,
    };
  } catch (error) {
    markUnavailable(unavailable, "basket(0)", error);
  }

  let basketStatus: number | undefined;
  try {
    basketStatus = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "basketStatus",
      args: [tpa1Basket.basketId],
    });
  } catch (error) {
    markUnavailable(unavailable, "basketStatus(0)", error);
  }

  let basketIdOf: { basketId: bigint; exists: boolean } | undefined;
  try {
    const result = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "basketIdOf",
      args: [tpa1Basket.token],
    });
    basketIdOf = { basketId: result[0], exists: result[1] };
  } catch (error) {
    markUnavailable(unavailable, "basketIdOf(TPA1)", error);
  }

  const token = await readTokenMetadata(tpa1Basket.token).catch(() => undefined);
  if (!token) unavailable.push("TPA1 token metadata");

  const constituentTokens = await Promise.all(
    tpa1Basket.constituents.map(async (constituent) => {
      try {
        return await readTokenMetadata(constituent.address);
      } catch {
        unavailable.push(`${constituent.symbol} token metadata`);
        return { address: constituent.address } satisfies TokenMetadata;
      }
    }),
  );

  const vaultBalances = await Promise.all(
    tpa1Basket.constituents.map(async (constituent) => {
      try {
        const balance = await client.readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "vaultBalance",
          args: [tpa1Basket.basketId, constituent.address],
        });
        return { symbol: constituent.symbol, asset: constituent.address, balance };
      } catch (error) {
        markUnavailable(unavailable, `vaultBalance(${constituent.symbol})`, error);
        return {
          symbol: constituent.symbol,
          asset: constituent.address,
          balance: undefined as bigint | undefined,
        };
      }
    }),
  );

  const canonicalPools = await Promise.all(
    tpa1Basket.canonicalPools.map(async (pool) => {
      let live: LiveCanonicalPool | undefined;
      try {
        const result = await client.readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "canonicalPool",
          args: [tpa1Basket.basketId, pool.asset],
        });
        live = {
          poolId: result.poolId,
          basketToken: result.basketToken,
          asset: result.asset,
          currency0: result.currency0,
          currency1: result.currency1,
          hook: result.hook,
          lpFee: result.lpFee,
          tickSpacing: result.tickSpacing,
          spotTick: result.spotTick,
        };
      } catch (error) {
        markUnavailable(unavailable, `canonicalPool(${pool.pair})`, error);
      }

      let protocol: LiveProtocolPool | undefined;
      try {
        const result = await client.readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "protocolPool",
          args: [pool.poolId],
        });
        protocol = {
          poolId: result.poolId,
          kind: result.kind,
          decommissioned: result.decommissioned,
          basketId: result.basketId,
          basketAsset: result.basketAsset,
          permanentLiquidity: result.permanentLiquidity,
          currency0: result.key.currency0,
          currency1: result.key.currency1,
          fee: result.key.fee,
          tickSpacing: result.key.tickSpacing,
          hooks: result.key.hooks,
        };
      } catch (error) {
        markUnavailable(unavailable, `protocolPool(${pool.pair})`, error);
      }

      return { documented: pool, live, protocol };
    }),
  );

  return {
    configuration,
    basketStatus,
    basketIdOf,
    token,
    constituentTokens,
    vaultBalances,
    canonicalPools,
    unavailable,
  };
}

async function pagePositionIds(
  client: PublicClient,
  positionId: bigint,
  functionName:
    | "basketIdsOfPosition"
    | "loanIdsOfPosition"
    | "liquidityPositionIdsOfPosition"
    | "riskSeriesIdsOfPosition",
): Promise<bigint[]> {
  const diamond = staticsDeployment.contracts.staticsDiamond.address;
  const collected: bigint[] = [];
  let cursor = 0n;
  const limit = POSITION_PORTFOLIO_MAX_PAGE_SIZE;

  for (let i = 0; i < 8; i += 1) {
    const [ids, nextCursor] = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName,
      args: [positionId, cursor, limit],
    });
    collected.push(...ids);
    if (nextCursor === 0n || ids.length === 0) break;
    cursor = nextCursor;
  }

  return collected;
}

async function pagePositionAssets(
  client: PublicClient,
  positionId: bigint,
): Promise<Address[]> {
  const diamond = staticsDeployment.contracts.staticsDiamond.address;
  const collected: Address[] = [];
  let cursor = 0n;
  const limit = POSITION_PORTFOLIO_MAX_PAGE_SIZE;

  for (let i = 0; i < 8; i += 1) {
    const [assets, nextCursor] = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "globalRewardAssetsOfPosition",
      args: [positionId, cursor, limit],
    });
    collected.push(...assets);
    if (nextCursor === 0n || assets.length === 0) break;
    cursor = nextCursor;
  }

  return collected;
}

export type PositionReadResult =
  | {
      status: "not_found";
      positionId: bigint;
      message: string;
    }
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "ok";
      positionId: bigint;
      owner?: Address;
      tokenURI?: string;
      tokenMetadata?: { name?: string; description?: string; image?: string };
      positionState?: PositionState;
      initializing?: boolean;
      closable?: boolean;
      stake?: StakePosition;
      rewardAssets?: Address[];
      portfolio?: PortfolioCounts;
      basketIds?: bigint[];
      loanIds?: bigint[];
      liquidityPositionIds?: bigint[];
      globalRewardAssets?: Address[];
      riskSeriesIds?: bigint[];
      basketCollateral?: BasketCollateralPosition[];
      loans?: LoanRecord[];
      unavailable: string[];
    };

function decodeTokenUri(uri: string): {
  name?: string;
  description?: string;
  image?: string;
} | undefined {
  try {
    const prefix = "data:application/json;base64,";
    if (uri.startsWith(prefix)) {
      const json = JSON.parse(
        globalThis.atob(uri.slice(prefix.length)),
      ) as { name?: string; description?: string; image?: string };
      return json;
    }
    if (uri.startsWith("data:application/json,")) {
      return JSON.parse(decodeURIComponent(uri.slice("data:application/json,".length)));
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function readPosition(rawId: string): Promise<PositionReadResult> {
  const trimmed = rawId.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return {
      status: "invalid",
      message: "Enter a numeric PositionNFT ID.",
    };
  }

  const positionId = BigInt(trimmed);
  const client = clientOrThrow();
  const diamond = staticsDeployment.contracts.staticsDiamond.address;
  const unavailable: string[] = [];

  let positionState: PositionState | undefined;
  try {
    const result = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "positionState",
      args: [positionId],
    });
    positionState = {
      exists: result.exists,
      stateNonce: result.stateNonce,
      activeLegCount: result.activeLegCount,
      unresolvedObligationCount: result.unresolvedObligationCount,
    };
  } catch (error) {
    markUnavailable(unavailable, "positionState", error);
  }

  if (positionState && !positionState.exists) {
    return {
      status: "not_found",
      positionId,
      message:
        "No position at this ID.",
    };
  }

  let owner: Address | undefined;
  try {
    owner = await client.readContract({
      address: diamond,
      abi: staticsAbi,
      functionName: "ownerOf",
      args: [positionId],
    });
  } catch (error) {
    const message = toUserErrorMessage(
      error,
      "No position at this ID.",
    );
    if (!positionState) {
      return { status: "not_found", positionId, message };
    }
    unavailable.push("ownerOf");
  }

  const [tokenURI, initializing, closable, stake, rewardAssets, portfolio] =
    await Promise.all([
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "tokenURI",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "tokenURI", error);
          return undefined;
        }),
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "positionInitializing",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "positionInitializing", error);
          return undefined;
        }),
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "isPositionClosable",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "isPositionClosable", error);
          return undefined;
        }),
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "stakePosition",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "stakePosition", error);
          return undefined;
        }),
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "positionRewardAssets",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "positionRewardAssets", error);
          return undefined;
        }),
      client
        .readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "positionPortfolioCounts",
          args: [positionId],
        })
        .catch((error) => {
          markUnavailable(unavailable, "positionPortfolioCounts", error);
          return undefined;
        }),
    ]);

  let basketIds: bigint[] | undefined;
  let loanIds: bigint[] | undefined;
  let liquidityPositionIds: bigint[] | undefined;
  let globalRewardAssets: Address[] | undefined;
  let riskSeriesIds: bigint[] | undefined;

  try {
    basketIds = await pagePositionIds(client, positionId, "basketIdsOfPosition");
  } catch (error) {
    markUnavailable(unavailable, "basketIdsOfPosition", error);
  }
  try {
    loanIds = await pagePositionIds(client, positionId, "loanIdsOfPosition");
  } catch (error) {
    markUnavailable(unavailable, "loanIdsOfPosition", error);
  }
  try {
    liquidityPositionIds = await pagePositionIds(
      client,
      positionId,
      "liquidityPositionIdsOfPosition",
    );
  } catch (error) {
    markUnavailable(unavailable, "liquidityPositionIdsOfPosition", error);
  }
  try {
    globalRewardAssets = await pagePositionAssets(client, positionId);
  } catch (error) {
    markUnavailable(unavailable, "globalRewardAssetsOfPosition", error);
  }
  try {
    riskSeriesIds = await pagePositionIds(
      client,
      positionId,
      "riskSeriesIdsOfPosition",
    );
  } catch (error) {
    markUnavailable(unavailable, "riskSeriesIdsOfPosition", error);
  }

  const basketCollateral: BasketCollateralPosition[] = [];
  if (basketIds) {
    for (const basketId of basketIds) {
      try {
        const result = await client.readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "basketCollateralPosition",
          args: [positionId, basketId],
        });
        basketCollateral.push({
          basketId,
          depositedShares: result.depositedShares,
          lockedShares: result.lockedShares,
          withdrawableAfterBlock: result.withdrawableAfterBlock,
        });
      } catch (error) {
        markUnavailable(unavailable, `basketCollateralPosition(${basketId})`, error);
      }
    }
  }

  const loans: LoanRecord[] = [];
  if (loanIds) {
    for (const loanId of loanIds) {
      try {
        const result = await client.readContract({
          address: diamond,
          abi: staticsAbi,
          functionName: "loan",
          args: [loanId],
        });
        loans.push({
          loanId,
          positionId: result.positionId,
          basketId: result.basketId,
          collateralShares: result.collateralShares,
          feeShares: result.feeShares,
          debtShares: result.debtShares,
          penaltyShares: result.penaltyShares,
          maturity: result.maturity,
          assets: result.assets,
          principals: result.principals,
        });
      } catch (error) {
        markUnavailable(unavailable, `loan(${loanId})`, error);
      }
    }
  }

  return {
    status: "ok",
    positionId,
    owner,
    tokenURI,
    tokenMetadata: tokenURI ? decodeTokenUri(tokenURI) : undefined,
    positionState,
    initializing,
    closable,
    stake: stake
      ? {
          stakedBalance: stake.stakedBalance,
          claimAssetCount: stake.claimAssetCount,
          optedInAssetCount: stake.optedInAssetCount,
        }
      : undefined,
    rewardAssets: rewardAssets ? [...rewardAssets] : undefined,
    portfolio: portfolio
      ? {
          basketCount: portfolio.basketCount,
          loanCount: portfolio.loanCount,
          liquidityPositionCount: portfolio.liquidityPositionCount,
          globalRewardAssetCount: portfolio.globalRewardAssetCount,
          riskSeriesCount: portfolio.riskSeriesCount,
        }
      : undefined,
    basketIds,
    loanIds,
    liquidityPositionIds,
    globalRewardAssets,
    riskSeriesIds,
    basketCollateral,
    loans,
    unavailable,
  };
}

export function unavailableLabel(field?: string) {
  return field ? `${UNAVAILABLE_FIELD} (${field})` : UNAVAILABLE_FIELD;
}
