import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";
import { ToastContainer } from "../common/Toast";
import { useAuthStore } from "../../store/useAuthStore";

export const RootLayout: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
