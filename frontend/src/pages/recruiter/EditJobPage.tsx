import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../api/job.api";
import { JobForm } from "../../components/jobs/JobForm";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { CreateJobInput, JobCompany } from "../../types";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "../../store/useToastStore";
import { ArrowLeft } from "lucide-react";

export const EditJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobApi.getJobById(id!),
    enabled: !!id,
  });

  const updateJobMutation = useMutation({
    mutationFn: (data: CreateJobInput) => jobApi.updateJob(id!, data),
    onSuccess: (updatedJob) => {
      toast.success("Job updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      navigate(`/jobs/${updatedJob._id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update job");
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <Link to="/recruiter/jobs" className="mt-4 inline-block text-indigo-600">
          Back to Listings
        </Link>
      </div>
    );
  }

  // Verify ownership
  const companyId =
    typeof job.company === "object" && job.company !== null
      ? (job.company as JobCompany)._id
      : job.company;

  if (companyId !== user?._id) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-rose-600">Unauthorized</h2>
        <p className="mt-2 text-sm text-slate-500">
          You are not the creator of this job posting.
        </p>
        <Link to="/recruiter/jobs" className="mt-4 inline-block text-indigo-600">
          Back to My Postings
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: CreateJobInput) => {
    await updateJobMutation.mutateAsync(data);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Postings
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Edit Job Vacancy
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update role responsibilities, compensation, or requirements
          </p>
        </div>
      </div>

      <JobForm
        initialData={job}
        onSubmit={handleSubmit}
        isLoading={updateJobMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
};
