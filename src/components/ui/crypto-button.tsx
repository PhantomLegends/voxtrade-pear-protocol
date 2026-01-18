import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cryptoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary-subtle hover:glow-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8",
        sm: "h-10 px-4 text-sm",
        lg: "h-16 px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CryptoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cryptoButtonVariants> {
  asChild?: boolean;
}

const CryptoButton = React.forwardRef<HTMLButtonElement, CryptoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(cryptoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
CryptoButton.displayName = "CryptoButton";

export { CryptoButton, cryptoButtonVariants };
