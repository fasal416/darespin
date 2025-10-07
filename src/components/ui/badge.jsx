import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Badge variants using CVA
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors",
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
        outline: "border",
        soft: "",
        ghost: "bg-transparent",
      },
      size: {
        xs: "h-4 text-[0.6rem] rounded-sm px-1.5",
        sm: "h-5 text-[0.65rem] rounded-md px-2",
        md: "h-6 text-xs rounded-md px-2.5",
        lg: "h-7 text-sm rounded-md px-3",
        xl: "h-8 text-sm rounded-lg px-3.5",
      },
    },
    compoundVariants: [
      // Solid variants for each color
      {
        variant: "solid",
        color: "primary",
        className: "bg-primary text-primary-foreground",
      },
      {
        variant: "solid",
        color: "secondary",
        className: "bg-secondary text-secondary-foreground",
      },
      {
        variant: "solid",
        color: "destructive",
        className: "bg-destructive text-destructive-foreground",
      },
      {
        variant: "solid",
        color: "success",
        className: "bg-success text-success-foreground",
      },
      {
        variant: "solid",
        color: "warning",
        className: "bg-warning text-warning-foreground",
      },
      {
        variant: "solid",
        color: "info",
        className: "bg-info text-info-foreground",
      },
      {
        variant: "solid",
        color: "muted",
        className: "bg-muted text-muted-foreground",
      },
      {
        variant: "solid",
        color: "accent",
        className: "bg-accent text-accent-foreground",
      },

      // Outline variants for each color
      {
        variant: "outline",
        color: "primary",
        className: "border-primary text-primary bg-transparent",
      },
      {
        variant: "outline",
        color: "secondary",
        className: "border-secondary text-secondary bg-transparent",
      },
      {
        variant: "outline",
        color: "destructive",
        className: "border-destructive text-destructive bg-transparent",
      },
      {
        variant: "outline",
        color: "success",
        className: "border-success text-success bg-transparent",
      },
      {
        variant: "outline",
        color: "warning",
        className: "border-warning text-warning bg-transparent",
      },
      {
        variant: "outline",
        color: "info",
        className: "border-info text-info bg-transparent",
      },
      {
        variant: "outline",
        color: "muted",
        className: "border-muted text-muted bg-transparent",
      },
      {
        variant: "outline",
        color: "accent",
        className: "border-accent text-accent bg-transparent",
      },

      // Soft variants for each color
      {
        variant: "soft",
        color: "primary",
        className: "bg-primary/20 text-primary",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "bg-secondary/20 text-secondary",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "bg-destructive/20 text-destructive",
      },
      {
        variant: "soft",
        color: "success",
        className: "bg-success/20 text-success",
      },
      {
        variant: "soft",
        color: "warning",
        className: "bg-warning/20 text-warning",
      },
      {
        variant: "soft",
        color: "info",
        className: "bg-info/20 text-info",
      },
      {
        variant: "soft",
        color: "muted",
        className: "bg-muted/20 text-muted",
      },
      {
        variant: "soft",
        color: "accent",
        className: "bg-accent/20 text-accent",
      },

      // Ghost variants for each color
      {
        variant: "ghost",
        color: "primary",
        className: "text-primary",
      },
      {
        variant: "ghost",
        color: "secondary",
        className: "text-secondary",
      },
      {
        variant: "ghost",
        color: "destructive",
        className: "text-destructive",
      },
      {
        variant: "ghost",
        color: "success",
        className: "text-success",
      },
      {
        variant: "ghost",
        color: "warning",
        className: "text-warning",
      },
      {
        variant: "ghost",
        color: "info",
        className: "text-info",
      },
      {
        variant: "ghost",
        color: "muted",
        className: "text-muted",
      },
      {
        variant: "ghost",
        color: "accent",
        className: "text-accent",
      },

      // Icon sizing based on badge size
      {
        size: "xs",
        className: "[&>svg]:w-2.5 [&>svg]:h-2.5",
      },
      {
        size: "sm",
        className: "[&>svg]:w-3 [&>svg]:h-3",
      },
      {
        size: "md",
        className: "[&>svg]:w-3.5 [&>svg]:h-3.5",
      },
      {
        size: "lg",
        className: "[&>svg]:w-4 [&>svg]:h-4",
      },
      {
        size: "xl",
        className: "[&>svg]:w-[1.125rem] [&>svg]:h-[1.125rem]",
      },
    ],
    defaultVariants: {
      color: "primary",
      variant: "solid",
      size: "md",
    },
  }
);

/**
 * @typedef {Object} BadgeProps
 * @property {'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'muted' | 'accent'} [color='primary']
 * @property {'solid' | 'outline' | 'soft' | 'ghost'} [variant='solid']
 * @property {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size='md']
 * @property {string} [className]
 * @property {React.ReactNode} children
 */

/**
 * @type {React.ForwardRefExoticComponent<
 *   BadgeProps & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const Badge = React.forwardRef(
  /**
   * @param {BadgeProps & React.HTMLAttributes<HTMLDivElement>} props
   * @param {React.Ref<HTMLDivElement>} ref
   */
  (
    {
      className,
      color = "primary",
      variant = "solid",
      size = "sm",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ color, variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
