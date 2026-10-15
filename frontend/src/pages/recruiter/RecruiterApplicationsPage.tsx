import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationApi } from "../../api/application.api";
import { RecruiterApplicationRow } from "../../components/applications/RecruiterApplicationRow";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { toast } from "../../store/useToastStore";
import { ApplicationApplicant, ApplicationStatus } from "../../types";
import { Search, Users, Filter } from "lucide-react";

export const RecruiterApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: applications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recruiter-applications"],
    queryFn: applicationApi.getRecruiterApplications,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: ApplicationStatus;
    }) => applicationApi.updateApplicationStatus(applicationId, status),
    onSuccess: (updatedApp) => {
      toast.success(`Application marked as ${updatedApp.status}`);
      queryClient.invalidateQueries({ queryKey: ["recruiter-applications"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const handleUpdateStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    await updateStatusMutation.mutateAsync({ applicationId, status });
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      const applicantName =
        typeof app.applicant === "object" && app.applicant !== null
          ? (app.applicant as ApplicationApplicant).fullname.toLowerCase()
          : "";
      const applicantEmail =
        typeof app.applicant === "object" && app.applicant !== null
          ? (app.applicant as ApplicationApplicant).email.toLowerCase()
          : "";
      const jobTitle = app.job?.title?.toLowerCase() || "";

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        applicantName.includes(q) ||
        applicantEmail.includes(q) ||
        jobTitle.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Candidate Applications Review
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review incoming applicants across all your active job postings and update hiring statuses
        </p>
      </div>

      {/* Filter Toolbar */}
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

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate or job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <LoadingSpinner fullPage text="Fetching applicant candidates..." />
      ) : error ? (
        <div className="p-8 text-center text-rose-500">
          Failed to load applications: {(error as Error).message}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Applications Received"
          description="Candidates haven't applied to your job postings yet. Keep your postings active and check back soon!"
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-8 h-8" />}
          title="No Applicants Match Selected Filter"
          description="Try selecting a different status filter or clearing your search keywords."
          actionLabel="Clear Filter"
          onAction={() => {
            setStatusFilter("all");
            setSearchTerm("");
          }}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredApplications.map((application) => (
            <RecruiterApplicationRow
              key={application._id}
              application={application}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
