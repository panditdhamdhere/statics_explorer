import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { DEPLOYMENT_LABEL } from "@/config/network";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-loaded",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Statics Explorer",
    template: "%s · Statics Explorer",
  },
  description:
    "A developer-focused, read-only explorer for the Statics Protocol Robinhood Chain Testnet integration-beta deployment.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>
          <div className="sr-only">{DEPLOYMENT_LABEL}</div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
