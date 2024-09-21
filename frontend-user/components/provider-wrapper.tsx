"use client";

import { getCsrfToken, getSession } from "next-auth/react";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  DynamicWagmiConnector,
} from "../lib/dynamic";

import { createConfig, WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { baseSepolia, gnosisChiado } from "viem/chains";

const config = createConfig({
  chains: [baseSepolia, gnosisChiado],
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(),
    [gnosisChiado.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        overrides: {
          evmNetworks: [
            {
              chainId: 10200,
              networkId: 10200,
              name: "Gnosis Chiado",
              iconUrls: [
                "https://d2j9klt7rsw34c.cloudfront.net/frontend/cms/logo/460b4330-bb1b-41d3-bb5f-b0cfb6f475aa.png",
              ],
              nativeCurrency: {
                name: "Testnet xDai on Chiado",
                symbol: "xDAI",
                decimals: 18,
              },
              rpcUrls: [
                "https://rpc.chiadochain.net",
                "https://rpc.chiado.gnosis.gateway.fm",
              ],
              blockExplorerUrls: ["https://gnosis-chiado.blockscout.com/"],
            },
            {
              chainId: 84532,
              networkId: 84532,
              name: "Base Sepolia",
              iconUrls: [
                "https://d2j9klt7rsw34c.cloudfront.net/frontend/cms/logo/460b4330-bb1b-41d3-bb5f-b0cfb6f475aa.png",
              ],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.base.org"],
              blockExplorerUrls: ["https://sepolia.basescan.org/"],
            },
          ],
        },
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: async (event) => {
            const authToken = await getAuthToken();

            if (!authToken) {
              return;
            }

            const csrfToken = await getCsrfToken();

            fetch("/api/auth/callback/credentials", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then((res) => {
                if (res.ok) {
                  getSession();
                } else {
                  console.error("Failed to log in");
                }
              })
              .catch((error) => {
                // Handle any exceptions
                console.error("Error logging in", error);
              });
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
