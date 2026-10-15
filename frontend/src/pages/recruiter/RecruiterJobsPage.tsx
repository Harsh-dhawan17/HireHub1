import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../api/job.api";
import { applicationApi } from "../../api/application.api";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "../../store/useToastStore";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { JobCompany } from "../../types";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Users,
  MapPin,
  Banknote,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getJobTypeColor,
} from "../../lib/utils";

export const RecruiterJobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Fetch all jobs
  const { data: allJobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobApi.getAllJobs,
  });

  // Fetch recruiter applications to compute applicant count per job
  const { data: applications = [] } = useQuery({
    queryKey: ["recruiter-applications"],
    queryFn: applicationApi.getRecruiterApplications,
  });

  // Filter jobs created by this recruiter
  const myJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const companyId =
        typeof job.company === "object" && job.company !== null
          ? (job.company as JobCompany)._id
          : job.company;
      return companyId === user?._id;
    });
  }, [allJobs, user]);

  // Map job ID to count of applicants
  const applicantCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach((app) => {
      if (app.job && typeof app.job === "object") {
        map[app.job._id] = (map[app.job._id] || 0) + 1;
      }
    });
    return map;
  }, [applications]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobApi.deleteJob(jobId),
    onSuccess: () => {
      toast.success("Job posting deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setJobToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete job");
      setJobToDelete(null);
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Job Postings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your open vacancies, monitor applications, and edit job listings
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <Button icon={<PlusCircle className="w-4 h-4" />}>
            Post New Job
          </Button>
        </Link>
      </div>

      {isJobsLoading ? (
        <LoadingSpinner fullPage text="Loading your posted vacancies..." />
      ) : myJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No Jobs Posted Yet"
          description="You haven't published any job opportunities yet. Create your first vacancy to start receiving qualified applicants!"
          actionLabel="Post Your First Job"
          onAction={() => (window.location.href = "/recruiter/jobs/create")}
        />
      ) : (
        <div className="space-y-4">
          {myJobs.map((job) => {
            const applicantCount = applicantCountMap[job._id] || 0;

            return (
              <div
                key={job._id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getJobTypeColor(
                        job.jobType
                      )}`}
                    >
                      {job.jobType}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(job.salary)}/yr
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Link to={`/jobs/${job._id}`}>
                    <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </Link>

                  <Link to={`/recruiter/jobs/edit/${job._id}`}>
                    <Button variant="outline" size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setJobToDelete(job._id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Confirm Job Deletion"
        description="Are you sure you want to delete this job posting? All applicants associated with this vacancy will remain archived."
      >
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setJobToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => jobToDelete && deleteMutation.mutate(jobToDelete)}
          >
            Delete Vacancy
          </Button>
        </div>
      </Modal>
    </div>
  );
};
