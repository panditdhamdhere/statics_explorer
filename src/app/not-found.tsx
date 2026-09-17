import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="kicker">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        This explorer only serves Overview, Basket, Interact, PositionNFT, Contracts,
        Developer, and About.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg"
      >
        Return to overview
      </Link>
    </div>
  );
}
