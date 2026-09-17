import { officialSources } from "@/config/sources";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-[12px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Statics Explorer · Robinhood Chain Testnet</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a
            href={officialSources.deployment}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Deployment
          </a>
          <a
            href={officialSources.sdk}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            SDK
          </a>
          <a
            href={officialSources.sdkRepository}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            SDK source
          </a>
        </div>
      </div>
    </footer>
  );
}
