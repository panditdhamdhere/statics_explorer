import type { Abi, Account, Address, PublicClient, WalletClient } from "viem";
import { ROBINHOOD_TESTNET_CHAIN_ID, robinhoodChainTestnet } from "@/config/network";
import { basketTokenAbi, staticsAbi, staticsTestnetFaucetAbi } from "@/lib/staticsSdk";
import { describeTxError } from "@/lib/txErrors";
import type { ConfirmedReceipt, PreparedTxStep, SimulationResult, TxPhase } from "@/types/tx";

export type TxClients = {
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
  chainId: number;
};

export type { SimulationResult } from "@/types/tx";

export async function assertCorrectChain(chainId: number) {
  if (chainId !== ROBINHOOD_TESTNET_CHAIN_ID) {
    throw new Error(
      "Wallet is not on Robinhood Chain Testnet. Switch to chain ID 46630 before sending a transaction.",
    );
  }
}

export async function simulateAndEstimate(
  clients: TxClients,
  step: PreparedTxStep,
): Promise<SimulationResult> {
  await assertCorrectChain(clients.chainId);

  const account = clients.account as Account | Address;
  try {
    const simulation = await clients.publicClient.simulateContract({
      account,
      address: step.contract,
      abi: abiForStep(step),
      functionName: step.functionName,
      args: step.args as never,
      value: step.value,
      chain: robinhoodChainTestnet,
    });

    const gas =
      simulation.request.gas ??
      (await clients.publicClient.estimateContractGas({
        account,
        address: step.contract,
        abi: abiForStep(step),
        functionName: step.functionName,
        args: step.args as never,
        value: step.value,
      }));
    const gasPrice = await clients.publicClient.getGasPrice().catch(() => undefined);

    return {
      ok: true,
      gas,
      gasPrice,
      estimatedFee: gasPrice !== undefined ? gas * gasPrice : undefined,
    };
  } catch (error) {
    const described = describeTxError(error);
    return { ok: false, error: described.message };
  }
}

export async function submitStep(params: {
  clients: TxClients;
  step: PreparedTxStep;
  actionLabel: string;
  onPhase: (phase: TxPhase, hash?: `0x${string}`) => void;
}): Promise<ConfirmedReceipt> {
  const { clients, step, actionLabel, onPhase } = params;
  await assertCorrectChain(clients.chainId);

  onPhase("awaiting-wallet");
  let hash: `0x${string}`;
  try {
    hash = await clients.walletClient.sendTransaction({
      account: clients.account,
      to: step.contract,
      data: step.calldata,
      value: step.value,
      chain: robinhoodChainTestnet,
    });
  } catch (error) {
    const described = describeTxError(error);
    const wrapped = new Error(described.message);
    (wrapped as Error & { kind?: string }).kind = described.kind;
    throw wrapped;
  }

  onPhase("submitted", hash);
  onPhase("confirming", hash);

  const receipt = await clients.publicClient.waitForTransactionReceipt({
    hash,
  });

  if (receipt.status !== "success") {
    throw new Error("The transaction was included but reverted onchain.");
  }

  onPhase("confirmed", hash);
  return {
    action: actionLabel,
    hash,
    blockNumber: receipt.blockNumber,
    status: "success",
    gasUsed: receipt.gasUsed,
  };
}

function abiForStep(step: PreparedTxStep): Abi {
  if (step.kind === "approve") return basketTokenAbi;
  if (step.kind === "faucet") return staticsTestnetFaucetAbi;
  return staticsAbi;
}
