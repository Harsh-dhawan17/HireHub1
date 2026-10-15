import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../api/job.api";
import { JobForm } from "../../components/jobs/JobForm";
import { CreateJobInput } from "../../types";
import { toast } from "../../store/useToastStore";
import { ArrowLeft } from "lucide-react";

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: (data: CreateJobInput) => jobApi.createJob(data),
    onSuccess: (job) => {
      toast.success("Job posting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate(`/jobs/${job._id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create job posting");
    },
  });

  const handleSubmit = async (data: CreateJobInput) => {
    await createJobMutation.mutateAsync(data);
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
            Post a New Vacancy
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fill in the details below to publish your opening to thousands of developers
          </p>
        </div>
      </div>

      <JobForm
        onSubmit={handleSubmit}
        isLoading={createJobMutation.isPending}
        submitLabel="Publish Job Opening"
      />
    </div>
  );
};
