import React from "react";
import { useToastStore, ToastType } from "../../store/useToastStore";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons: Record<ToastType, React.ReactNode> = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
        };

        const borderColors: Record<ToastType, string> = {
          success: "border-emerald-500/30",
          error: "border-rose-500/30",
          info: "border-blue-500/30",
          warning: "border-amber-500/30",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border ${borderColors[toast.type]} text-slate-800 dark:text-slate-100 transition-all transform animate-in slide-in-from-bottom-5 duration-200`}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium leading-relaxed flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
