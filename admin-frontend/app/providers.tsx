"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { gnosisChiado, baseSepolia, lineaSepolia, morphHolesky } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "Aiconomy",
  projectId: "db1b8a46ffa835bd9a48a89ff540f990",
  chains: [gnosisChiado, baseSepolia, lineaSepolia, morphHolesky],
  ssr: true, 
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#9ca3af",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
          modalSize="compact"
        >
          {children}{" "}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
