import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "purple" | "cyan";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
  dot = false,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantClasses = {
    default:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    primary:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
    purple:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800",
    cyan:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800",
  };

  const dotClasses = {
    default: "bg-slate-500",
    primary: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClasses[variant])}
        />
      )}
      {children}
    </span>
  );
};
