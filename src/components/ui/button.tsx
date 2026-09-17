import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-[color,background-color,border-color,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-accent text-ink hover:brightness-110",
        secondary:
          "border border-zinc-500 bg-zinc-900 text-zinc-50 hover:border-zinc-400 hover:bg-zinc-800",
        ghost:
          "border border-zinc-600 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50",
        danger:
          "border border-red-400 bg-red-950 text-red-50 hover:bg-red-900",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-10 px-5",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
