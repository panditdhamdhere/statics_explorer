"use client";

import { type ReactNode } from "react";
import { isRpcConfigured } from "@/config/network";
import { RpcSetupBanner } from "@/components/RpcSetupBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LiveTestnetIndicator } from "@/components/LiveTestnetIndicator";
import { NetworkStatus } from "@/components/NetworkStatus";
import { Kicker } from "@/components/ui/kicker";

export function AppShell({
  children,
  kicker,
  title,
  description,
}: {
  children: ReactNode;
  kicker?: string;
  title?: string;
  description?: string;
}) {
  const rpcConfigured = isRpcConfigured();

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <NetworkStatus />
          <LiveTestnetIndicator />
        </div>
      </div>
      {!rpcConfigured ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-5">
          <RpcSetupBanner />
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">
        {title ? (
          <div className="mb-10 max-w-3xl space-y-3">
            {kicker ? <Kicker>{kicker}</Kicker> : null}
            <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.35rem]">
              {title}
            </h1>
            {description ? (
              <p className="text-[15px] leading-7 text-muted">{description}</p>
            ) : null}
          </div>
        ) : null}
        {children}
      </main>
      <Footer />
    </div>
  );
}
