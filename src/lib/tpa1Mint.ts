import {
  encodeFunctionData,
  type Address,
  type PublicClient,
} from "viem";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/config/network";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import {
  BasketStatus,
  SHARE_SCALE,
  basketTokenAbi,
  buildMintCall,
  staticsAbi,
} from "@/lib/staticsSdk";
import type { MintQuoteLeg, PreparedMint, PreparedTxStep } from "@/types/tx";
import type { WalletAssetSnapshot } from "@/types/tx";

export const TPA1_MINT_DIAMOND =
  staticsDeployment.contracts.staticsDiamond.address;

export function defaultMintShares(): bigint {
  return SHARE_SCALE;
}

export async function quoteTpa1Mint(params: {
  client: PublicClient;
  shares: bigint;
  receiver: Address;
  snapshot: WalletAssetSnapshot;
}): Promise<PreparedMint> {
  const { client, shares, receiver, snapshot } = params;
  if (shares <= 0n) {
    throw new Error("Mint shares must be greater than zero.");
  }

  const [status, quoted, blockNumber] = await Promise.all([
    client.readContract({
      address: TPA1_MINT_DIAMOND,
      abi: staticsAbi,
      functionName: "basketStatus",
      args: [tpa1Basket.basketId],
    }),
    client.readContract({
      address: TPA1_MINT_DIAMOND,
      abi: staticsAbi,
      functionName: "quoteMint",
      args: [tpa1Basket.basketId, shares],
    }),
    client.getBlockNumber().catch(() => undefined),
  ]);

  if (status !== BasketStatus.Active) {
    throw new Error(
      `TPA1 is not in Active status (${status}). Minting is not available from the current deployment/interface.`,
    );
  }

  if (quoted.length !== tpa1Basket.constituents.length) {
    throw new Error(
      "quoteMint returned an unexpected asset count for TPA1.",
    );
  }

  const legs: MintQuoteLeg[] = tpa1Basket.constituents.map((constituent, index) => {
    const amountIn = quoted[index] ?? 0n;
    const token = snapshot.tokens.find(
      (entry) => entry.address.toLowerCase() === constituent.address.toLowerCase(),
    );
    const balance = token?.balance;
    const allowance = token?.allowance;
    return {
      symbol: constituent.symbol,
      asset: constituent.address,
      amountIn,
      decimals: token?.decimals,
      balance,
      allowance,
      sufficientBalance: balance !== undefined ? balance >= amountIn : false,
      sufficientAllowance: allowance !== undefined ? allowance >= amountIn : false,
    };
  });

  return {
    basketId: tpa1Basket.basketId,
    shares,
    receiver,
    diamond: TPA1_MINT_DIAMOND,
    quotedAtBlock: blockNumber,
    maxAmountsIn: quoted,
    legs,
    sdkMethod: "buildMintCall",
    quoteMethod: "quoteMint",
    functionName: "mint",
    calldata: buildMintCall(tpa1Basket.basketId, shares, receiver, quoted),
  };
}

export function buildMintSteps(prepared: PreparedMint): PreparedTxStep[] {
  const steps: PreparedTxStep[] = [];

  for (const leg of prepared.legs) {
    if (leg.sufficientAllowance) continue;
    steps.push({
      id: `approve-${leg.symbol}`,
      kind: "approve",
      label: `Approve ${leg.symbol}`,
      contract: leg.asset,
      functionName: "approve",
      sdkMethod: "basketTokenAbi.approve",
      args: [prepared.diamond, leg.amountIn],
      calldata: encodeFunctionData({
        abi: basketTokenAbi,
        functionName: "approve",
        args: [prepared.diamond, leg.amountIn],
      }),
      spender: prepared.diamond,
      token: leg.asset,
      amount: leg.amountIn,
    });
  }

  steps.push({
    id: "mint-tpa1",
    kind: "mint",
    label: "Mint TPA1",
    contract: prepared.diamond,
    functionName: "mint",
    sdkMethod: "buildMintCall",
    args: [
      prepared.basketId,
      prepared.shares,
      prepared.receiver,
      prepared.maxAmountsIn,
    ],
    calldata: prepared.calldata,
  });

  return steps;
}

export function validateMintSafety(params: {
  chainId?: number;
  account?: Address;
  prepared: PreparedMint;
}): string[] {
  const issues: string[] = [];
  if (params.chainId !== ROBINHOOD_TESTNET_CHAIN_ID) {
    issues.push("Wallet is not on Robinhood Chain Testnet (chain ID 46630).");
  }
  if (!params.account) {
    issues.push("Connect a wallet before preparing a mint.");
  } else if (params.account.toLowerCase() !== params.prepared.receiver.toLowerCase()) {
    issues.push("Receiver does not match the connected wallet.");
  }
  if (params.prepared.diamond.toLowerCase() !== TPA1_MINT_DIAMOND.toLowerCase()) {
    issues.push("Unexpected Diamond address.");
  }
  if (params.prepared.basketId !== tpa1Basket.basketId) {
    issues.push("Unexpected basket ID.");
  }
  for (const [index, expected] of tpa1Basket.constituents.entries()) {
    const leg = params.prepared.legs[index];
    if (!leg || leg.asset.toLowerCase() !== expected.address.toLowerCase()) {
      issues.push(`Unexpected ${expected.symbol} address in quoteMint result.`);
    }
    if (leg && !leg.sufficientBalance) {
      issues.push(
        `Insufficient ${expected.symbol} balance for this mint. Claim faucet fixtures or reduce the share amount.`,
      );
    }
  }
  return issues;
}
