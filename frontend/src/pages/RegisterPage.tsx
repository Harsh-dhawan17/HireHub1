import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { UserRole } from "../types";
import {
  Briefcase,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type Step = "details" | "otp" | "password";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  // Form state
  const [step, setStep] = useState<Step>("details");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [otpPreviewUrl, setOtpPreviewUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── Step 1: Send OTP ────────────────────────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!fullname.trim() || fullname.trim().length < 2) {
      setServerError("Full name must be at least 2 characters");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setServerError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp({ email: email.trim().toLowerCase(), fullname: fullname.trim() });
      toast.success("Verification code sent! Check your email inbox.");
      if (res.previewUrl) {
        setOtpPreviewUrl(res.previewUrl);
        toast.info("📧 Dev mode: Email preview link is available below the OTP form.", { duration: 8000 });
      }
      setStep("otp");
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = (err as Error).message || "Failed to send OTP";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────────────

  const handleOtpInput = (index: number, value: string) => {
    // Allow only digits
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setServerError("");

    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setServerError("Please enter the complete 6-digit code");
      return;
    }
    setServerError("");
    setStep("password");
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setServerError("");
    try {
      const res = await authApi.sendOtp({ email, fullname });
      toast.success("New verification code sent!");
      if (res.previewUrl) setOtpPreviewUrl(res.previewUrl);
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setServerError((err as Error).message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // ─── Step 3: Set Password & Register ─────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (password.length < 6) {
      setServerError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setServerError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const regRes = await authApi.register({
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        otp: otp.join(""),
      });
      setUser(regRes.user, regRes.token);
      toast.success(`🎉 Welcome to HireHub, ${regRes.user.fullname}!`);
      if (regRes.user.role === "recruiter") {
        navigate("/recruiter/jobs", { replace: true });
      } else {
        navigate("/jobs", { replace: true });
      }
    } catch (err) {
      const msg = (err as Error).message || "Registration failed";
      setServerError(msg);
      // If OTP invalid/expired, send back to OTP step
      if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("code") || msg.toLowerCase().includes("expired")) {
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Progress dots ────────────────────────────────────────────────────────────

  const steps: { key: Step; label: string }[] = [
    { key: "details", label: "Account Info" },
    { key: "otp", label: "Verify Email" },
    { key: "password", label: "Set Password" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-2">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join thousands of developers and recruiters collaborating on HireHub
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0">
          {steps.map((s, i) => {
            const isDone = i < stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isDone
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-16 sm:w-24 mx-1 mb-4 transition-all duration-500 ${
                      i < stepIndex ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
              {serverError}
            </div>
          )}

          {/* ── STEP 1: ACCOUNT DETAILS ────────────────────── */}
          {step === "details" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 block mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      role === "student"
                        ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-bold">Job Seeker</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Discover vacancies & apply
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      role === "recruiter"
                        ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-bold">Recruiter</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Post jobs & hire talent
                    </span>
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                leftIcon={<UserIcon className="w-4 h-4" />}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
                >
                  Send Verification Code
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP VERIFICATION ──────────────────── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Check Your Inbox
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {email}
                  </span>
                </p>
              </div>

              {/* OTP Digit Boxes */}
              <div
                className="flex justify-center gap-2 sm:gap-3"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      digit
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-400"
                    }`}
                  />
                ))}
              </div>

              {/* Dev preview link */}
              {otpPreviewUrl && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    🧪 Dev mode — no real email sent.{" "}
                    <a
                      href={otpPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold"
                    >
                      Click here to preview the email
                    </a>
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={otp.join("").length < 6}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Verify & Continue
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setStep("details"); setOtp(["", "", "", "", "", ""]); setServerError(""); }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                  className={`flex items-center gap-1 font-semibold transition-colors ${
                    countdown > 0 || isResending
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: SET PASSWORD ─────────────────────── */}
          {step === "password" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center space-y-1.5 mb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Email Verified! 🎉
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set a secure password to complete your account setup
                </p>
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          password.length >= level * 3
                            ? level <= 1
                              ? "bg-rose-400"
                              : level <= 2
                              ? "bg-amber-400"
                              : level <= 3
                              ? "bg-indigo-400"
                              : "bg-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {password.length < 4
                      ? "Too short"
                      : password.length < 7
                      ? "Fair"
                      : password.length < 10
                      ? "Good"
                      : "Strong"}{" "}
                    password
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Create Account & Join HireHub
                </Button>
              </div>

              <button
                type="button"
                onClick={() => { setStep("otp"); setServerError(""); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to OTP
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
