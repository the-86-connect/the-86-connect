import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer press select-none overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-red-sm hover:bg-red-700 hover:shadow-red",
        accent:
          "bg-primary text-white shadow-red-sm hover:bg-red-700 hover:shadow-red",
        outline:
          "border border-border bg-white text-foreground hover:border-primary/30 hover:bg-primary/5 shadow-soft-sm hover:shadow-soft-md",
        ghost: "text-foreground hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft-sm hover:shadow-soft-md",
        glass:
          "glass-strong text-foreground shadow-soft-md hover:shadow-soft-lg border border-white/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-red-sm hover:bg-red-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5 py-2.5 text-sm",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-10 text-base sm:text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative inline-flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
