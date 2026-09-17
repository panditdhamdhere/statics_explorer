import type { Address, PublicClient } from "viem";
import { staticsDeployment, tpa1Basket } from "@/config/staticsDeployment";
import { basketTokenAbi } from "@/lib/staticsSdk";
import type { TokenBalance, WalletAssetSnapshot } from "@/types/tx";

export const trackedWalletAssets = [
  {
    symbol: "TSLA",
    address: tpa1Basket.constituents[0].address,
  },
  {
    symbol: "PLTR",
    address: tpa1Basket.constituents[1].address,
  },
  {
    symbol: "AMD",
    address: tpa1Basket.constituents[2].address,
  },
  {
    symbol: "TPA1",
    address: tpa1Basket.token,
  },
  {
    symbol: "USDstx",
    address: staticsDeployment.contracts.usdstx.address,
  },
  {
    symbol: "STATICS",
    address: staticsDeployment.contracts.statics.address,
  },
  {
    symbol: "mUSDG",
    address: staticsDeployment.contracts.mockUsdg.address,
  },
] as const;

export async function readWalletAssetSnapshot(
  client: PublicClient,
  account: Address,
  spender: Address,
): Promise<WalletAssetSnapshot> {
  const [nativeBalance, tokens] = await Promise.all([
    client.getBalance({ address: account }).catch(() => undefined),
    Promise.all(
      trackedWalletAssets.map(async (asset): Promise<TokenBalance> => {
        const [decimals, balance, allowance] = await Promise.all([
          client
            .readContract({
              address: asset.address,
              abi: basketTokenAbi,
              functionName: "decimals",
            })
            .catch(() => undefined),
          client
            .readContract({
              address: asset.address,
              abi: basketTokenAbi,
              functionName: "balanceOf",
              args: [account],
            })
            .catch(() => undefined),
          client
            .readContract({
              address: asset.address,
              abi: basketTokenAbi,
              functionName: "allowance",
              args: [account, spender],
            })
            .catch(() => undefined),
        ]);
        return {
          symbol: asset.symbol,
          address: asset.address,
          decimals,
          balance,
          allowance,
        };
      }),
    ),
  ]);

  return { account, nativeBalance, tokens };
}
