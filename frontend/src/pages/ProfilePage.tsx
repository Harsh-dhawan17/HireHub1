import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { applicationApi } from "../api/application.api";
import { jobApi } from "../api/job.api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { getInitials, formatDate } from "../lib/utils";
import {
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: authApi.getProfile,
  });

  const user = profileData?.user;

  // Student stats
  const { data: studentApps = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationApi.getMyApplications,
    enabled: user?.role === "student",
  });

  // Recruiter stats
  const { data: allJobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobApi.getAllJobs,
    enabled: user?.role === "recruiter",
  });

  const { data: recruiterApps = [] } = useQuery({
    queryKey: ["recruiter-applications"],
    queryFn: applicationApi.getRecruiterApplications,
    enabled: user?.role === "recruiter",
  });

  const myPostedJobs = allJobs.filter((j) => {
    if (typeof j.company === "object" && j.company !== null) {
      return j.company._id === user?._id;
    }
    return j.company === user?._id;
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading user profile..." />;
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Failed to load profile.</p>
      </div>
    );
  }

  const acceptedCount = studentApps.filter((a) => a.status === "accepted").length;
  const pendingCount = studentApps.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {getInitials(user.fullname)}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.fullname}
                </h1>
                <Badge
                  variant={user.role === "recruiter" ? "purple" : "primary"}
                  size="sm"
                  className="capitalize"
                >
                  {user.role}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                {user.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Member since {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4 text-rose-500" />}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
          >
            Sign Out
          </Button>
        </div>

        {/* Role-Specific Metrics */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Account Activity Overview
          </h3>

          {user.role === "student" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    Total Applications
                  </p>
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-indigo-900 dark:text-indigo-100">
                  {studentApps.length}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Accepted Applications
                  </p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                  {acceptedCount}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Under Review
                  </p>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-amber-900 dark:text-amber-100">
                  {pendingCount}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Jobs Posted By You
                  </p>
                  <Briefcase className="w-4 h-4 text-purple-500" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-purple-900 dark:text-purple-100">
                  {myPostedJobs.length}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    Total Applicants Received
                  </p>
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-indigo-900 dark:text-indigo-100">
                  {recruiterApps.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          {user.role === "student" ? (
            <Link to="/student/applications" className="w-full sm:w-auto">
              <Button icon={<ArrowRight className="w-4 h-4" />}>
                Go to My Applications
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/recruiter/jobs" className="w-full sm:w-auto">
                <Button variant="outline" icon={<Briefcase className="w-4 h-4" />}>
                  Manage Posted Jobs
                </Button>
              </Link>
              <Link to="/recruiter/applications" className="w-full sm:w-auto">
                <Button icon={<ArrowRight className="w-4 h-4" />}>
                  View Job Applicants
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
