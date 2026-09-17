import { createConfig, http, injected } from "wagmi";
import {
  DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL,
  getConfiguredRpcUrl,
  robinhoodChainTestnet,
} from "@/config/network";

const rpcUrl = getConfiguredRpcUrl() ?? DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL;

export const wagmiConfig = createConfig({
  chains: [robinhoodChainTestnet],
  connectors: [injected({ shimDisconnect: true })],
  ssr: false,
  transports: {
    [robinhoodChainTestnet.id]: http(rpcUrl, {
      timeout: 20_000,
      retryCount: 2,
    }),
  },
});
