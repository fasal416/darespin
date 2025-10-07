import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

// Button variants using CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
  {
    variants: {
      color: {
        primary: "",
        secondary: "",
        destructive: "",
        success: "",
        warning: "",
        info: "",
        muted: "",
        accent: "",
      },
      variant: {
        solid: "",
        outline: "border-2 bg-transparent",
        ghost: "bg-transparent",
        soft: "",
        link: "underline-offset-4 hover:underline p-0",
        icon: "shrink-0",
      },
      size: {
        xs: "h-5 text-[0.6rem] rounded-sm",
        sm: "h-7 text-xs rounded-md",
        md: "h-9 text-sm rounded-md",
        lg: "h-11 text-sm rounded-lg",
        xl: "h-12 text-base rounded-xl",
      },
    },
    compoundVariants: [
      // Solid variants for each color
      {
        variant: "solid",
        color: "primary",
        className: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        variant: "solid",
        color: "secondary",
        className:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      },
      {
        variant: "solid",
        color: "destructive",
        className:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      {
        variant: "solid",
        color: "success",
        className: "bg-success text-success-foreground hover:bg-success/90",
      },
      {
        variant: "solid",
        color: "warning",
        className: "bg-warning text-warning-foreground hover:bg-warning/90",
      },
      {
        variant: "solid",
        color: "info",
        className: "bg-info text-info-foreground hover:bg-info/90",
      },
      {
        variant: "solid",
        color: "muted",
        className: "bg-muted text-muted-foreground hover:bg-muted/90",
      },
      {
        variant: "solid",
        color: "accent",
        className: "bg-accent text-accent-foreground hover:bg-accent/90",
      },

      // Outline variants for each color
      {
        variant: "outline",
        color: "primary",
        className:
          "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground",
      },
      {
        variant: "outline",
        color: "destructive",
        className:
          "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "border-success text-success hover:bg-success hover:text-success-foreground",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "border-warning text-warning hover:bg-warning hover:text-warning-foreground",
      },
      {
        variant: "outline",
        color: "info",
        className:
          "border-info text-info hover:bg-info hover:text-info-foreground",
      },
      {
        variant: "outline",
        color: "muted",
        className:
          "border-muted text-muted hover:bg-muted hover:text-muted-foreground",
      },
      {
        variant: "outline",
        color: "accent",
        className:
          "border-accent text-accent hover:bg-accent hover:text-accent-foreground",
      },

      // Ghost variants for each color
      {
        variant: "ghost",
        color: "primary",
        className: "text-primary hover:bg-primary/10",
      },
      {
        variant: "ghost",
        color: "secondary",
        className: "text-secondary hover:bg-secondary/10",
      },
      {
        variant: "ghost",
        color: "destructive",
        className: "text-destructive hover:bg-destructive/10",
      },
      {
        variant: "ghost",
        color: "success",
        className: "text-success hover:bg-success/10",
      },
      {
        variant: "ghost",
        color: "warning",
        className: "text-warning hover:bg-warning/10",
      },
      {
        variant: "ghost",
        color: "info",
        className: "text-info hover:bg-info/10",
      },
      {
        variant: "ghost",
        color: "muted",
        className: "text-muted hover:bg-muted/10",
      },
      {
        variant: "ghost",
        color: "accent",
        className: "text-accent hover:bg-accent/10",
      },

      // Soft variants for each color
      {
        variant: "soft",
        color: "primary",
        className: "bg-primary/20 text-primary hover:bg-primary/30",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "bg-secondary/20 text-secondary hover:bg-secondary/30",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
      },
      {
        variant: "soft",
        color: "success",
        className: "bg-success/20 text-success hover:bg-success/30",
      },
      {
        variant: "soft",
        color: "warning",
        className: "bg-warning/20 text-warning hover:bg-warning/30",
      },
      {
        variant: "soft",
        color: "info",
        className: "bg-info/20 text-info hover:bg-info/30",
      },
      {
        variant: "soft",
        color: "muted",
        className: "bg-muted/20 text-muted hover:bg-muted/30",
      },
      {
        variant: "soft",
        color: "accent",
        className: "bg-accent/20 text-accent hover:bg-accent/30",
      },

      // Link variants for each color
      {
        variant: "link",
        color: "primary",
        className: "text-primary",
      },
      {
        variant: "link",
        color: "secondary",
        className: "text-secondary",
      },
      {
        variant: "link",
        color: "destructive",
        className: "text-destructive",
      },
      {
        variant: "link",
        color: "success",
        className: "text-success",
      },
      {
        variant: "link",
        color: "warning",
        className: "text-warning",
      },
      {
        variant: "link",
        color: "info",
        className: "text-info",
      },
      {
        variant: "link",
        color: "muted",
        className: "text-muted",
      },
      {
        variant: "link",
        color: "accent",
        className: "text-accent",
      },

      // Icon variants (same as solid)
      {
        variant: "icon",
        color: "primary",
        className: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        variant: "icon",
        color: "secondary",
        className:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      },
      {
        variant: "icon",
        color: "destructive",
        className:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      {
        variant: "icon",
        color: "success",
        className: "bg-success text-success-foreground hover:bg-success/90",
      },
      {
        variant: "icon",
        color: "warning",
        className: "bg-warning text-warning-foreground hover:bg-warning/90",
      },
      {
        variant: "icon",
        color: "info",
        className: "bg-info text-info-foreground hover:bg-info/90",
      },
      {
        variant: "icon",
        color: "muted",
        className: "bg-muted text-muted-foreground hover:bg-muted/90",
      },
      {
        variant: "icon",
        color: "accent",
        className: "bg-accent text-accent-foreground hover:bg-accent/90",
      },

      // Size adjustments for non-icon variants
      {
        variant: ["solid", "outline", "ghost", "soft"],
        size: "xs",
        className: "px-2.5",
      },
      {
        variant: ["solid", "outline", "ghost", "soft"],
        size: "sm",
        className: "px-3",
      },
      {
        variant: ["solid", "outline", "ghost", "soft"],
        size: "md",
        className: "px-4",
      },
      {
        variant: ["solid", "outline", "ghost", "soft"],
        size: "lg",
        className: "px-6",
      },
      {
        variant: ["solid", "outline", "ghost", "soft"],
        size: "xl",
        className: "px-8",
      },

      // Icon size adjustments (square)
      {
        variant: "icon",
        size: "xs",
        className: "w-7",
      },
      {
        variant: "icon",
        size: "sm",
        className: "w-8",
      },
      {
        variant: "icon",
        size: "md",
        className: "w-9",
      },
      {
        variant: "icon",
        size: "lg",
        className: "w-10",
      },
      {
        variant: "icon",
        size: "xl",
        className: "w-12",
      },
    ],
    defaultVariants: {
      color: "primary",
      variant: "solid",
      size: "md",
    },
  }
);

// Spinner size mapping
const spinnerSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

/**
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'muted' | 'accent'} [color='primary']
 * @property {'solid' | 'outline' | 'ghost' | 'soft' | 'link' | 'icon'} [variant='solid']
 * @property {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size='md']
 * @property {boolean} [loading=false]
 * @property {string | null} [loadingText]
 * @property {'default' | 'circle' | 'pinwheel' | 'circle-filled' | 'ellipsis' | 'ring' | 'bars' | 'infinite'} [spinnerVariant='default']
 * @property {'left' | 'right'} [spinnerPosition='left']
 * @property {boolean} [disabled=false]
 * @property {boolean} [asChild=false]
 * @property {string} [className]
 * @property {string} [innerClassName]
 * @property {React.ReactNode} children
 */

/**
 * @type {React.ForwardRefExoticComponent<
 *   ButtonProps & React.RefAttributes<HTMLButtonElement>
 * >}
 */
const Button = React.forwardRef(
  /**
   * @param {ButtonProps} props
   * @param {React.Ref<HTMLButtonElement>} ref
   */
  (
    {
      className,
      innerClassName,
      color = "primary",
      variant = "solid",
      size = "md",
      loading = false,
      loadingText,
      spinnerVariant = "default",
      spinnerPosition = "left",
      disabled = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const spinnerSize = spinnerSizes[size];

    return (
      <Comp
        className={cn(buttonVariants({ color, variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="">
            <div className="opacity-0">{children}</div>
            <span className="absolute inset-0 flex items-center justify-center gap-1">
              {(spinnerPosition === "left" || !loadingText) && (
                <Spinner variant={spinnerVariant} size={spinnerSize} />
              )}
              {loadingText && <span>{loadingText}</span>}
              {spinnerPosition === "right" && loadingText && (
                <Spinner variant={spinnerVariant} size={spinnerSize} />
              )}
            </span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
