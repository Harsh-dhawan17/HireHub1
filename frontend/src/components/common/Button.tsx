import React, { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
      outline:
        "border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200",
      ghost:
        "hover:bg-slate-100 text-slate-700 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 focus:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 focus:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
