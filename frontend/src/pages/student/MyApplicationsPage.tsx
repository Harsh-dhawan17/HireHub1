import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { applicationApi } from "../../api/application.api";
import { StudentApplicationCard } from "../../components/applications/StudentApplicationCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import { ApplicationStatus } from "../../types";
import { Briefcase, Search } from "lucide-react";

export const MyApplicationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: applications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationApi.getMyApplications,
  });

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      const matchesSearch =
        !searchTerm.trim() ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        app.job?.location?.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your application lifecycle and hiring status in real-time
          </p>
        </div>

        <Link to="/jobs">
          <Button icon={<Briefcase className="w-4 h-4" />}>
            Find More Jobs
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {(["all", "pending", "accepted", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {st === "all" ? `All (${applications.length})` : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter applied role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner fullPage text="Loading your applications..." />
      ) : error ? (
        <div className="p-8 text-center text-rose-500">
          Failed to load applications: {(error as Error).message}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applications Submitted Yet"
          description="You haven't applied to any job vacancies yet. Explore available jobs and submit your first application today!"
          actionLabel="Browse Jobs Now"
          onAction={() => (window.location.href = "/jobs")}
        />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Match Filter"
          description="None of your applications match the selected status or search term."
          actionLabel="Reset Filter"
          onAction={() => {
            setStatusFilter("all");
            setSearchTerm("");
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((application) => (
            <StudentApplicationCard
              key={application._id}
              application={application}
            />
          ))}
        </div>
      )}
    </div>
  );
};
