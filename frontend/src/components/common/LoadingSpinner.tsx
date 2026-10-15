import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  fullPage = false,
}) => {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={`${sizeMap[size]} animate-spin text-indigo-600 dark:text-indigo-400`}
      />
      {text && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-8 flex items-center justify-center">{content}</div>;
};
