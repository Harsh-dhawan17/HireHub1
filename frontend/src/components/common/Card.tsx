import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/90",
        hoverEffect &&
          "hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 dark:hover:border-indigo-700/60 dark:hover:shadow-indigo-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
