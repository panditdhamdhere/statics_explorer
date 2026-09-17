import type { Address, Hex } from "viem";

export type DataOrigin = "deployment" | "live" | "documentation";

export type LiveStatus = "idle" | "loading" | "success" | "error" | "unconfigured";

export type TokenMetadata = {
  address: Address;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
};

export type LiveBasketConfiguration = {
  token: Address;
  creator: Address;
  status: number;
  assets: readonly Address[];
  bundleAmounts: readonly bigint[];
  flashFeeBps: number;
  originationFeeBps: number;
  extensionFeeBps: number;
  ltvBps: number;
  recoveryPenaltyBps: number;
  loanDuration: number;
};

export type LiveCanonicalPool = {
  poolId: Hex;
  basketToken: Address;
  asset: Address;
  currency0: Address;
  currency1: Address;
  hook: Address;
  lpFee: number;
  tickSpacing: number;
  spotTick: number;
};

export type LiveProtocolPool = {
  poolId: Hex;
  kind: number;
  decommissioned: boolean;
  basketId: bigint;
  basketAsset: Address;
  permanentLiquidity: bigint;
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
};

export type PositionState = {
  exists: boolean;
  stateNonce: bigint;
  activeLegCount: bigint;
  unresolvedObligationCount: bigint;
};

export type StakePosition = {
  stakedBalance: bigint;
  claimAssetCount: bigint;
  optedInAssetCount: bigint;
};

export type PortfolioCounts = {
  basketCount: bigint;
  loanCount: bigint;
  liquidityPositionCount: bigint;
  globalRewardAssetCount: bigint;
  riskSeriesCount: bigint;
};

export type BasketCollateralPosition = {
  basketId: bigint;
  depositedShares: bigint;
  lockedShares: bigint;
  withdrawableAfterBlock: bigint;
};

export type LoanRecord = {
  loanId: bigint;
  positionId: bigint;
  basketId: bigint;
  collateralShares: bigint;
  feeShares: bigint;
  debtShares: bigint;
  penaltyShares: bigint;
  maturity: number;
  assets: readonly Address[];
  principals: readonly bigint[];
};
