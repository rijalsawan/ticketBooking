import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary: "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg hover:shadow-orange-500/20",
      secondary: "bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg",
      outline: "border-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-transparent",
      ghost: "text-white/60 hover:bg-white/5 bg-transparent",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    };

    const sizes = {
      sm: "text-sm px-4 py-1.5",
      md: "text-base px-6 py-2.5",
      lg: "text-lg px-8 py-3",
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
