import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { UserRole } from "../../types";
import { ShieldAlert } from "lucide-react";
import { Button } from "../common/Button";

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuthStore();

  if (user?.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This area requires a <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">{requiredRole}</span> account. You are currently logged in as a <span className="font-semibold capitalize">{user?.role}</span>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
