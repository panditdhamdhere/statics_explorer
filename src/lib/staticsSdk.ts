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
 * Verified exports from the deployment-pinned SDK revision.
 * Do not import master-only APIs against the recorded testnet addresses.
 *
 * `robinhoodChain` is generated from deployments/robinhood-chain-4663.json
 * and reports chainId 4663 (Robinhood Chain). It is a v4 infrastructure
 * binding, not the Statics testnet deployment map.
 */
export const pinnedSdk = {
  packageName: "@statics-protocol/sdk",
  commit: PINNED_SDK_COMMIT,
  install: PINNED_SDK_INSTALL,
  loaded: true,
  robinhoodChainBinding: {
    network: robinhoodChain.network,
    chainId: robinhoodChain.chainId,
    note: "SDK robinhoodChain bindings target Robinhood Chain (4663), not the recorded testnet Statics deployment (46630). Use official testnet deployment addresses for Statics contracts.",
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
