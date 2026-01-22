"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { base } from "viem/chains";
import { http } from "wagmi";

const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    ssr: false, // 🔥 REQUIRED for Privy signer hydration
});
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmkipzfpz00btl40daogzvzw6"}
            config={{
                appearance: {
                    theme: "light",
                    accentColor: "#C9A24D",
                    logo: "https://auth.privy.io/logos/privy-logo.png",
                },
                loginMethodsAndOrder: {
                    primary: ['privy:cm5l76en107pt1lpl2ve2ocfy'],
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
