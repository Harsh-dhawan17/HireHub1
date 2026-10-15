import React, { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, options, id, ...props },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 cursor-pointer",
            "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500"
              : "border-slate-200 dark:border-slate-800",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
