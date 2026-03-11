import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
      ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-9",
      lg: "text-base px-6 py-2.5 h-11",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <span className="spinner" aria-hidden />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
