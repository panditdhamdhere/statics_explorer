"use client";

import { useCallback, useMemo, useState } from "react";
import { parseUnits, type Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/config/network";
import { buildFaucetClaimStep } from "@/lib/faucet";
import {
  TPA1_MINT_DIAMOND,
  buildMintSteps,
  quoteTpa1Mint,
  validateMintSafety,
} from "@/lib/tpa1Mint";
import { describeTxError } from "@/lib/txErrors";
import { simulateAndEstimate, submitStep } from "@/lib/sendStaticsTx";
import { getPublicClient } from "@/lib/viem";
import { readWalletAssetSnapshot } from "@/lib/walletAssets";
import type {
  BalanceDelta,
  ConfirmedReceipt,
  PreparedMint,
  PreparedTxStep,
  SimulationResult,
  TxPhase,
  WalletAssetSnapshot,
} from "@/types/tx";

const TPA1_DECIMALS = 18;

export function useInteractFlow() {
  const { address, chainId, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const wagmiPublicClient = usePublicClient();
  const [sharesInput, setSharesInput] = useState("1");
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [steps, setSteps] = useState<PreparedTxStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [prepared, setPrepared] = useState<PreparedMint>();
  const [simulation, setSimulation] = useState<SimulationResult>();
  const [receipts, setReceipts] = useState<ConfirmedReceipt[]>([]);
  const [before, setBefore] = useState<WalletAssetSnapshot>();
  const [after, setAfter] = useState<WalletAssetSnapshot>();
  const [error, setError] = useState<string>();

  const parsedShares = useMemo(() => {
    try {
      if (!sharesInput.trim()) return undefined;
      return parseUnits(sharesInput.trim(), TPA1_DECIMALS);
    } catch {
      return undefined;
    }
  }, [sharesInput]);

  const currentStep = steps[stepIndex];
  const onCorrectChain = chainId === ROBINHOOD_TESTNET_CHAIN_ID;
  const clientsReady = Boolean(isConnected && address && walletClient && wagmiPublicClient);

  const loadSnapshot = useCallback(async () => {
    const client = getPublicClient();
    if (!client || !address) return undefined;
    return readWalletAssetSnapshot(client, address, TPA1_MINT_DIAMOND);
  }, [address]);

  const reset = useCallback(() => {
    setPhase("idle");
    setSteps([]);
    setStepIndex(0);
    setPrepared(undefined);
    setSimulation(undefined);
    setReceipts([]);
    setBefore(undefined);
    setAfter(undefined);
    setError(undefined);
  }, []);

  const prepareMint = useCallback(async () => {
    setError(undefined);
    setReceipts([]);
    setAfter(undefined);
    setPhase("preparing");
    try {
      const client = getPublicClient();
      if (!client) throw new Error("RPC URL is not configured.");
      if (!address) throw new Error("Connect a wallet before preparing a mint.");
      if (!parsedShares || parsedShares <= 0n) {
        throw new Error("Enter a TPA1 amount greater than zero.");
      }
      const snapshot = await loadSnapshot();
      if (!snapshot) throw new Error("Unable to read wallet balances.");
      setBefore(snapshot);
      const next = await quoteTpa1Mint({
        client,
        shares: parsedShares,
        receiver: address,
        snapshot,
      });
      const issues = validateMintSafety({
        chainId,
        account: address,
        prepared: next,
      });
      if (issues.length > 0) throw new Error(issues[0]);
      const nextSteps = buildMintSteps(next);
      setPrepared(next);
      setSteps(nextSteps);
      setStepIndex(0);
      if (!walletClient || !wagmiPublicClient) {
        setSimulation(undefined);
        setPhase("idle");
        return;
      }
      const result = await simulateAndEstimate(
        {
          publicClient: wagmiPublicClient,
          walletClient,
          account: address,
          chainId: chainId ?? 0,
        },
        nextSteps[0],
      );
      setSimulation(result);
      setPhase(result.ok ? "idle" : "failed");
      if (!result.ok) setError(result.error);
    } catch (caught) {
      const described = describeTxError(caught);
      setPhase(described.kind === "rejected" ? "rejected" : "failed");
      setError(caught instanceof Error ? caught.message : described.message);
    }
  }, [address, chainId, loadSnapshot, parsedShares, wagmiPublicClient, walletClient]);

  const runCurrentStep = useCallback(async () => {
    if (!currentStep || !address || !walletClient || !wagmiPublicClient) {
      setError("Wallet client is not ready.");
      return;
    }
    setError(undefined);
    setPhase("preparing");

    const client = getPublicClient();
    let stepToSend = currentStep;
    if (currentStep.kind === "mint" && client && parsedShares) {
      const snapshot = await loadSnapshot();
      if (!snapshot) {
        setPhase("failed");
        setError("Unable to re-read balances before mint.");
        return;
      }
      try {
        const fresh = await quoteTpa1Mint({
          client,
          shares: parsedShares,
          receiver: address,
          snapshot,
        });
        const issues = validateMintSafety({
          chainId,
          account: address,
          prepared: fresh,
        });
        if (issues.length > 0) throw new Error(issues[0]);
        const refreshedSteps = buildMintSteps(fresh);
        const mintStep = refreshedSteps.find((step) => step.kind === "mint");
        if (!mintStep) throw new Error("Mint step is missing after re-quote.");
        stepToSend = mintStep;
        setPrepared(fresh);
        setSteps((existing) =>
          existing.map((step) => (step.kind === "mint" ? mintStep : step)),
        );
      } catch (caught) {
        const described = describeTxError(caught);
        setPhase("failed");
        setError(caught instanceof Error ? caught.message : described.message);
        return;
      }
    }

    const clients = {
      publicClient: wagmiPublicClient,
      walletClient,
      account: address,
      chainId: chainId ?? 0,
    };
    const simulated = await simulateAndEstimate(clients, stepToSend);
    setSimulation(simulated);
    if (!simulated.ok) {
      setPhase("failed");
      setError(simulated.error);
      return;
    }
    try {
      const receipt = await submitStep({
        clients,
        step: stepToSend,
        actionLabel: stepToSend.label,
        onPhase: (next) => setPhase(next),
      });
      setReceipts((existing) => [...existing, receipt]);
      const snapshot = await loadSnapshot();
      if (snapshot) setAfter(snapshot);
      const nextIndex = stepIndex + 1;
      if (nextIndex < steps.length) {
        setStepIndex(nextIndex);
        setPhase("idle");
        setSimulation(undefined);
      } else {
        setPhase("confirmed");
      }
    } catch (caught) {
      const described = describeTxError(caught);
      setPhase(described.kind === "rejected" ? "rejected" : "failed");
      setError(caught instanceof Error ? caught.message : described.message);
    }
  }, [
    address,
    chainId,
    currentStep,
    loadSnapshot,
    parsedShares,
    stepIndex,
    steps.length,
    wagmiPublicClient,
    walletClient,
  ]);

  const runFaucetClaim = useCallback(async () => {
    if (!address || !walletClient || !wagmiPublicClient) {
      setError("Wallet client is not ready.");
      return;
    }
    setError(undefined);
    setReceipts([]);
    setAfter(undefined);
    setPhase("preparing");
    const step = buildFaucetClaimStep();
    setSteps([step]);
    setStepIndex(0);
    const snapshot = await loadSnapshot();
    if (snapshot) setBefore(snapshot);
    const clients = {
      publicClient: wagmiPublicClient,
      walletClient,
      account: address,
      chainId: chainId ?? 0,
    };
    const simulated = await simulateAndEstimate(clients, step);
    setSimulation(simulated);
    if (!simulated.ok) {
      setPhase("failed");
      setError(simulated.error);
      return;
    }
    try {
      const receipt = await submitStep({
        clients,
        step,
        actionLabel: "Claim faucet",
        onPhase: (next) => setPhase(next),
      });
      setReceipts([receipt]);
      const nextSnapshot = await loadSnapshot();
      if (nextSnapshot) setAfter(nextSnapshot);
      setPhase("confirmed");
    } catch (caught) {
      const described = describeTxError(caught);
      setPhase(described.kind === "rejected" ? "rejected" : "failed");
      setError(caught instanceof Error ? caught.message : described.message);
    }
  }, [address, chainId, loadSnapshot, wagmiPublicClient, walletClient]);

  const deltas: BalanceDelta[] = useMemo(() => {
    if (!before) return [];
    const compare = after ?? before;
    return ["TSLA", "PLTR", "AMD", "TPA1", "USDstx", "STATICS", "mUSDG"].map(
      (symbol) => {
        const beforeToken = before.tokens.find((token) => token.symbol === symbol);
        const afterToken = compare.tokens.find((token) => token.symbol === symbol);
        return {
          symbol,
          before: beforeToken?.balance,
          after: afterToken?.balance,
          decimals: afterToken?.decimals ?? beforeToken?.decimals,
        };
      },
    );
  }, [after, before]);

  return {
    sharesInput,
    setSharesInput,
    parsedShares,
    phase,
    steps,
    stepIndex,
    currentStep,
    prepared,
    simulation,
    receipts,
    before,
    after,
    deltas,
    error,
    isConnected,
    address: address as Address | undefined,
    chainId,
    onCorrectChain,
    clientsReady,
    prepareMint,
    runCurrentStep,
    runFaucetClaim,
    reset,
    loadSnapshot,
  };
}
