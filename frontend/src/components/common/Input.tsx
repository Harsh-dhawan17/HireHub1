import React, { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400",
              "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-500 font-medium animate-in fade-in-50 duration-150">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
