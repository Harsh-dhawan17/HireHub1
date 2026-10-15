import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Briefcase, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/jobs";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setServerError("");
      const response = await authApi.login(data);
      setUser(response.user, response.token);
      toast.success(`Welcome back, ${response.user.fullname}!`);
      
      // Navigate to intended page or role landing
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else if (response.user.role === "recruiter") {
        navigate("/recruiter/jobs", { replace: true });
      } else {
        navigate("/jobs", { replace: true });
      }
    } catch (err) {
      const msg = (err as Error).message || "Invalid email or password";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-2">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your applications, saved jobs, or recruiter portal
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
