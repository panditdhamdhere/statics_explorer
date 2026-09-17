import {
  BaseError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  type Hex,
} from "viem";
import { staticsBasketErrorAbi } from "@/lib/staticsSdk";

const USER_REJECTED = /user rejected|denied|rejected the request|request reset/i;

const erc20ErrorAbi = [
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      { name: "sender", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [{ name: "spender", type: "address" }],
  },
] as const;

export function isUserRejected(error: unknown): boolean {
  if (!error) return false;
  const raw =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error);
  return USER_REJECTED.test(raw);
}

function formatDecodedError(name: string, args: readonly unknown[] | undefined) {
  if (!args || args.length === 0) return name;
  return `${name}(${args.map((arg) => String(arg)).join(", ")})`;
}

function decodeCustomError(data: Hex): string | undefined {
  for (const abi of [staticsBasketErrorAbi, erc20ErrorAbi]) {
    try {
      const decoded = decodeErrorResult({ abi, data });
      return formatDecodedError(decoded.errorName, decoded.args);
    } catch {
      continue;
    }
  }
  return undefined;
}

export function describeTxError(error: unknown): {
  kind: "rejected" | "reverted" | "failed";
  message: string;
} {
  if (isUserRejected(error)) {
    return {
      kind: "rejected",
      message: "The wallet request was rejected.",
    };
  }

  if (error instanceof BaseError) {
    const reverted = error.walk(
      (value) => value instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      const data = reverted.data;
      if (data?.errorName) {
        return {
          kind: "reverted",
          message: `Simulation reverted: ${formatDecodedError(data.errorName, data.args)}`,
        };
      }
      const raw = (reverted.raw as Hex | undefined) ?? undefined;
      if (raw) {
        const decoded = decodeCustomError(raw);
        if (decoded) {
          return { kind: "reverted", message: `Simulation reverted: ${decoded}` };
        }
      }
      return {
        kind: "reverted",
        message: reverted.shortMessage || "The contract call reverted.",
      };
    }

    return {
      kind: "failed",
      message: error.shortMessage || error.message,
    };
  }

  if (error instanceof Error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "failed", message: "The transaction could not be completed." };
}
