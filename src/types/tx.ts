import type { Address, Hash, Hex } from "viem";

export type TxPhase =
  | "idle"
  | "preparing"
  | "awaiting-wallet"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed"
  | "rejected";

export type SimulationResult = {
  ok: boolean;
  gas?: bigint;
  gasPrice?: bigint;
  estimatedFee?: bigint;
  error?: string;
};

export type TokenBalance = {
  symbol: string;
  address: Address;
  decimals?: number;
  balance?: bigint;
  allowance?: bigint;
};

export type WalletAssetSnapshot = {
  account: Address;
  nativeBalance?: bigint;
  tokens: TokenBalance[];
};

export type MintQuoteLeg = {
  symbol: string;
  asset: Address;
  amountIn: bigint;
  decimals?: number;
  balance?: bigint;
  allowance?: bigint;
  sufficientBalance: boolean;
  sufficientAllowance: boolean;
};

export type PreparedMint = {
  basketId: bigint;
  shares: bigint;
  receiver: Address;
  diamond: Address;
  quotedAtBlock?: bigint;
  maxAmountsIn: readonly bigint[];
  legs: MintQuoteLeg[];
  sdkMethod: "buildMintCall";
  quoteMethod: "quoteMint";
  functionName: "mint";
  calldata: Hex;
};

export type TxStepKind = "approve" | "mint" | "faucet";

export type PreparedTxStep = {
  id: string;
  kind: TxStepKind;
  label: string;
  contract: Address;
  functionName: string;
  sdkMethod: string;
  args: readonly unknown[];
  value?: bigint;
  calldata: Hex;
  spender?: Address;
  token?: Address;
  amount?: bigint;
};

export type ConfirmedReceipt = {
  action: string;
  hash: Hash;
  blockNumber: bigint;
  status: "success" | "reverted";
  gasUsed?: bigint;
};

export type BalanceDelta = {
  symbol: string;
  before?: bigint;
  after?: bigint;
  decimals?: number;
};
