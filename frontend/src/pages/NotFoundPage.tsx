import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xl">
        <span className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
          404
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for doesn't exist or has been relocated.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button icon={<Home className="w-4 h-4" />}>Back to Home</Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Explore Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
