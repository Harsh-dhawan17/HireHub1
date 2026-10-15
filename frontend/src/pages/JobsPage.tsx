import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/job.api";
import { applicationApi } from "../api/application.api";
import { JobCard } from "../components/jobs/JobCard";
import { JobFilters, FilterState } from "../components/jobs/JobFilters";
import { Pagination } from "../components/common/Pagination";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { ApplyJobModal } from "../components/applications/ApplyJobModal";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { Job, JobCompany, ApplyJobPayload } from "../types";

const PAGE_SIZE = 6;

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    jobType: searchParams.get("jobType") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    sortBy: (searchParams.get("sortBy") as FilterState["sortBy"]) || "newest",
  });

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
    if (filters.sortBy !== "newest") params.set("sortBy", filters.sortBy);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch all jobs
  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    error: jobsError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobApi.getAllJobs,
  });

  // If student is logged in, fetch their applications
  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationApi.getMyApplications,
    enabled: isAuthenticated && user?.role === "student",
  });

  const appliedJobIds = useMemo(() => {
    const set = new Set<string>();
    myApplications.forEach((app) => {
      if (app.job && typeof app.job === "object") {
        set.add(app.job._id);
      }
    });
    return set;
  }, [myApplications]);

  // Apply mutation — now accepts full payload with CV
  const applyMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: ApplyJobPayload }) =>
      applicationApi.applyForJob(jobId, payload),
    onSuccess: () => {
      toast.success("🎉 Application & CV submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setApplyModalOpen(false);
      setSelectedJob(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit application");
    },
  });

  // Called when user clicks Quick Apply on a job card — opens modal
  const handleOpenApply = (job: Job) => {
    if (!isAuthenticated) {
      toast.info("Please log in to apply for this job");
      return;
    }
    if (user?.role !== "student") {
      toast.warning("Only candidates can apply for jobs");
      return;
    }
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (payload: ApplyJobPayload) => {
    if (!selectedJob) return;
    await applyMutation.mutateAsync({ jobId: selectedJob._id, payload });
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((j) => {
        const companyName =
          typeof j.company === "object" && j.company !== null
            ? (j.company as JobCompany).fullname.toLowerCase()
            : "";
        return (
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          companyName.includes(q) ||
          j.requirements?.some((r) => r.toLowerCase().includes(q))
        );
      });
    }

    if (filters.location.trim()) {
      const loc = filters.location.toLowerCase().trim();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (filters.jobType) {
      result = result.filter((j) => j.jobType === filters.jobType);
    }

    if (filters.experienceLevel) {
      result = result.filter((j) => j.experienceLevel === filters.experienceLevel);
    }

    switch (filters.sortBy) {
      case "salary-desc":
        result.sort((a, b) => b.salary - a.salary);
        break;
      case "salary-asc":
        result.sort((a, b) => a.salary - b.salary);
        break;
      case "positions-desc":
        result.sort((a, b) => b.position - a.position);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [jobs, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      location: "",
      jobType: "",
      experienceLevel: "",
      sortBy: "newest",
    });
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Job Openings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find your dream tech role from top companies. Upload your CV directly when you apply.
        </p>
      </div>

      {/* Filter Component */}
      <div className="mb-8">
        <JobFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={filteredJobs.length}
        />
      </div>

      {/* Content Area */}
      {isJobsLoading ? (
        <LoadingSpinner fullPage text="Fetching open positions..." />
      ) : jobsError ? (
        <div className="p-8 text-center text-rose-500">
          Failed to load jobs: {(jobsError as Error).message}
        </div>
      ) : paginatedJobs.length === 0 ? (
        <EmptyState
          title="No Matching Jobs Found"
          description="We couldn't find any job vacancies matching your criteria. Try adjusting your filters or search keywords."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                hasApplied={appliedJobIds.has(job._id)}
                onApply={() => handleOpenApply(job)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Apply Modal — opened when clicking Quick Apply on any job card */}
      <ApplyJobModal
        job={selectedJob}
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={handleApplySubmit}
        isLoading={applyMutation.isPending}
      />
    </div>
  );
};
