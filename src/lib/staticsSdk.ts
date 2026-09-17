import {
  BasketStatus,
  POSITION_PORTFOLIO_MAX_PAGE_SIZE,
  SHARE_SCALE,
  allowsExposureIncrease,
  basketTokenAbi,
  buildMintCall,
  buildTestnetFaucetClaimCall,
  robinhoodChain,
  staticsAbi,
  staticsBasketErrorAbi,
  staticsPositionPortfolioAbi,
  staticsTestnetFaucetAbi,
} from "@statics-protocol/sdk";
import { PINNED_SDK_COMMIT, PINNED_SDK_INSTALL } from "@/config/sources";

/**
 * Exports from the pinned SDK (`PINNED_SDK_COMMIT`).
 * `robinhoodChain` is chain 4663 (Robinhood v4), not Statics testnet 46630.
 */
export const pinnedSdk = {
  packageName: "@statics-protocol/sdk",
  commit: PINNED_SDK_COMMIT,
  install: PINNED_SDK_INSTALL,
  loaded: true,
  robinhoodChainBinding: {
    network: robinhoodChain.network,
    chainId: robinhoodChain.chainId,
    note: "SDK robinhoodChain is chain 4663. Statics testnet contracts are on 46630.",
  },
} as const;

export {
  BasketStatus,
  POSITION_PORTFOLIO_MAX_PAGE_SIZE,
  SHARE_SCALE,
  allowsExposureIncrease,
  basketTokenAbi,
  buildMintCall,
  buildTestnetFaucetClaimCall,
  robinhoodChain,
  staticsAbi,
  staticsBasketErrorAbi,
  staticsPositionPortfolioAbi,
  staticsTestnetFaucetAbi,
};

export const basketStatusLabel: Record<number, string> = {
  [BasketStatus.Active]: "Active",
  [BasketStatus.Quarantined]: "Quarantined",
  [BasketStatus.ExitOnly]: "ExitOnly",
};

export function getBasketStatusLabel(status: number): string {
  return basketStatusLabel[status] ?? `Unknown (${status})`;
}
