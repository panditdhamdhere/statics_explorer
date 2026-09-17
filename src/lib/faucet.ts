import type { Address, PublicClient } from "viem";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import {
  basketTokenAbi,
  buildTestnetFaucetClaimCall,
  staticsTestnetFaucetAbi,
} from "@/lib/staticsSdk";
import type { PreparedTxStep } from "@/types/tx";

export const STATICS_FAUCET = staticsDeployment.contracts.staticsFaucet.address;

const knownFaucetTokens: Record<string, string> = {
  [staticsDeployment.contracts.mockUsdg.address.toLowerCase()]: "mUSDG",
  [staticsDeployment.contracts.statics.address.toLowerCase()]: "STATICS",
  [tpa1Basket.constituents[0].address.toLowerCase()]: "TSLA",
  [tpa1Basket.constituents[1].address.toLowerCase()]: "PLTR",
  [tpa1Basket.constituents[2].address.toLowerCase()]: "AMD",
};

export type FaucetAsset = {
  token: Address;
  amount: bigint;
  symbol?: string;
  decimals?: number;
};

export type FaucetStatus = {
  address: Address;
  cooldown?: bigint;
  assetCount?: bigint;
  lastClaimAt?: bigint;
  nextClaimAt?: bigint;
  blockTimestamp?: bigint;
  canClaim: boolean;
  assets: FaucetAsset[];
  unavailable: string[];
};

export async function readFaucetStatus(
  client: PublicClient,
  account?: Address,
): Promise<FaucetStatus> {
  const unavailable: string[] = [];

  async function read<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch {
      unavailable.push(label);
      return undefined;
    }
  }

  const [cooldown, assetCount, block, lastClaimAt, nextClaimAt] = await Promise.all([
    read("COOLDOWN", () =>
      client.readContract({
        address: STATICS_FAUCET,
        abi: staticsTestnetFaucetAbi,
        functionName: "COOLDOWN",
      }),
    ),
    read("ASSET_COUNT", () =>
      client.readContract({
        address: STATICS_FAUCET,
        abi: staticsTestnetFaucetAbi,
        functionName: "ASSET_COUNT",
      }),
    ),
    client.getBlock().catch(() => undefined),
    account
      ? read("lastClaimAt", () =>
          client.readContract({
            address: STATICS_FAUCET,
            abi: staticsTestnetFaucetAbi,
            functionName: "lastClaimAt",
            args: [account],
          }),
        )
      : Promise.resolve(undefined),
    account
      ? read("nextClaimAt", () =>
          client.readContract({
            address: STATICS_FAUCET,
            abi: staticsTestnetFaucetAbi,
            functionName: "nextClaimAt",
            args: [account],
          }),
        )
      : Promise.resolve(undefined),
  ]);

  const assets: FaucetAsset[] = [];
  if (assetCount !== undefined) {
    for (let index = 0n; index < assetCount; index += 1n) {
      const entry = await read(`asset(${index})`, () =>
        client.readContract({
          address: STATICS_FAUCET,
          abi: staticsTestnetFaucetAbi,
          functionName: "asset",
          args: [index],
        }),
      );
      if (!entry) continue;
      const token = entry[0];
      const amount = entry[1];
      const [symbol, decimals] = await Promise.all([
        client
          .readContract({
            address: token,
            abi: basketTokenAbi,
            functionName: "symbol",
          })
          .catch(() => knownFaucetTokens[token.toLowerCase()]),
        client
          .readContract({
            address: token,
            abi: basketTokenAbi,
            functionName: "decimals",
          })
          .catch(() => undefined),
      ]);
      assets.push({
        token,
        amount,
        symbol: symbol ?? knownFaucetTokens[token.toLowerCase()],
        decimals,
      });
    }
  }

  const blockTimestamp = block?.timestamp;
  const canClaim =
    Boolean(account) &&
    nextClaimAt !== undefined &&
    blockTimestamp !== undefined &&
    nextClaimAt <= blockTimestamp;

  return {
    address: STATICS_FAUCET,
    cooldown,
    assetCount,
    lastClaimAt: lastClaimAt !== undefined ? BigInt(lastClaimAt) : undefined,
    nextClaimAt,
    blockTimestamp,
    canClaim,
    assets,
    unavailable,
  };
}

export function buildFaucetClaimStep(): PreparedTxStep {
  return {
    id: "faucet-claim",
    kind: "faucet",
    label: "Claim faucet",
    contract: STATICS_FAUCET,
    functionName: "claim",
    sdkMethod: "buildTestnetFaucetClaimCall",
    args: [],
    calldata: buildTestnetFaucetClaimCall(),
  };
}
