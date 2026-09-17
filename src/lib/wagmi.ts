import { createConfig, http, injected, type CreateConnectorFn } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import {
  DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL,
  getConfiguredRpcUrl,
  getWalletConnectProjectId,
  robinhoodChainTestnet,
} from "@/config/network";

const rpcUrl = getConfiguredRpcUrl() ?? DOCUMENTED_ROBINHOOD_TESTNET_RPC_URL;

function walletConnectMetadataUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3001";
}

function getConnectors(): CreateConnectorFn[] {
  const connectors: CreateConnectorFn[] = [
    injected({ shimDisconnect: true }),
  ];

  const projectId = getWalletConnectProjectId();
  if (!projectId) return connectors;

  const appUrl = walletConnectMetadataUrl();
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "Statics Explorer",
        description:
          "Developer explorer for the Statics Protocol Robinhood Chain Testnet integration-beta.",
        url: appUrl,
        icons: [`${appUrl}/logo.svg`],
      },
    }),
  );

  return connectors;
}

export const wagmiConfig = createConfig({
  chains: [robinhoodChainTestnet],
  connectors: getConnectors(),
  ssr: false,
  transports: {
    [robinhoodChainTestnet.id]: http(rpcUrl, {
      timeout: 20_000,
      retryCount: 2,
    }),
  },
});
