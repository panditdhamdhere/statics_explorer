"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@/components/ConnectWallet";
import { officialSources } from "@/config/sources";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/basket", label: "Basket" },
  { href: "/interact", label: "Interact" },
  { href: "/position", label: "PositionNFT" },
  { href: "/contracts", label: "Contracts" },
  { href: "/developer", label: "Developer" },
  { href: "/about", label: "About" },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1.5 text-[13px] transition-colors",
              active
                ? "bg-panel-2 text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Statics
            <span className="font-normal text-muted"> Explorer</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center overflow-x-auto md:flex">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <a
            href={officialSources.introduction}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] text-muted hover:text-foreground sm:inline"
          >
            Docs
          </a>
          <ConnectWallet />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
        <NavLinks pathname={pathname} />
      </nav>
    </header>
  );
}
