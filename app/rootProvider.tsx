"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  console.log('[DEBUG] RootProvider rendering');
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  console.log('[DEBUG] OnchainKit API Key:', apiKey && apiKey !== 'your-cdp-api-key' ? 'Present' : 'Missing');

  return (
    <OnchainKitProvider
      apiKey={apiKey && apiKey !== 'your-cdp-api-key' ? apiKey : undefined}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
