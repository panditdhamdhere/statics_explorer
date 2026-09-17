import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="kicker">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        This page does not exist.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-8")}>
        Back home
      </Link>
    </div>
  );
}
