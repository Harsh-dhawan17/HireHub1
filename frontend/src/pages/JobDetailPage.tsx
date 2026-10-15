import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/job.api";
import { applicationApi } from "../api/application.api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { JobCompany, ApplyJobPayload } from "../types";
import { ApplyJobModal } from "../components/applications/ApplyJobModal";
import {
  MapPin,
  Banknote,
  Clock,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  Share2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getJobTypeColor,
} from "../lib/utils";

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Fetch job
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobApi.getJobById(id!),
    enabled: !!id,
  });

  // Fetch applications if student to check applied state
  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationApi.getMyApplications,
    enabled: isAuthenticated && user?.role === "student",
  });

  const hasApplied = myApplications.some(
    (app) => app.job && typeof app.job === "object" && app.job._id === id
  );

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: (payload: ApplyJobPayload) => applicationApi.applyForJob(id!, payload),
    onSuccess: () => {
      toast.success("Congratulations! Your CV and application have been submitted.");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setApplyModalOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to apply for job");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => jobApi.deleteJob(id!),
    onSuccess: () => {
      toast.success("Job posting deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/recruiter/jobs");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete job");
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Job Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested job vacancy might have expired or been removed.
        </p>
        <div className="mt-6">
          <Link to="/jobs">
            <Button icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const company =
    typeof job.company === "object" && job.company !== null
      ? (job.company as JobCompany)
      : { _id: "", fullname: "Company", email: "" };

  const isOwner =
    isAuthenticated &&
    user?.role === "recruiter" &&
    company._id === user._id;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Job URL copied to clipboard");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {company.fullname}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-400">
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {job.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getJobTypeColor(
                    job.jobType
                  )}`}
                >
                  {job.jobType}
                </span>
                <Badge variant="purple" size="md">
                  {job.experienceLevel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
            >
              Share
            </Button>

            {isOwner && (
              <>
                <Link to={`/recruiter/jobs/edit/${job._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteModalOpen(true)}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </>
            )}

            {user?.role === "student" && (
              <Button
                size="md"
                variant={hasApplied ? "secondary" : "primary"}
                disabled={hasApplied}
                onClick={() => setApplyModalOpen(true)}
                icon={hasApplied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : undefined}
              >
                {hasApplied ? "Already Applied" : "Apply For Position"}
              </Button>
            )}

            {!isAuthenticated && (
              <Button
                size="md"
                onClick={() => {
                  toast.info("Please login to apply");
                  navigate("/login");
                }}
              >
                Login to Apply
              </Button>
            )}
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <Banknote className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Salary</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(job.salary)}/yr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <MapPin className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Location</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {job.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <GraduationCap className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Experience</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {job.experienceLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Openings</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {job.position} {job.position === 1 ? "seat" : "seats"}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Skills & Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((req, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 text-xs font-semibold"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Role Description
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Recruiter / Company Details */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Posted by recruiter:
            </span>{" "}
            {company.fullname} ({company.email})
          </div>
          <div>Last updated: {formatDate(job.updatedAt)}</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Job Posting"
        description="Are you sure you want to permanently delete this job listing? This action cannot be undone."
      >
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Yes, Delete Job
          </Button>
        </div>
      </Modal>

      {/* Candidate Apply & CV Upload Modal */}
      <ApplyJobModal
        job={job}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={async (payload) => {
          await applyMutation.mutateAsync(payload);
        }}
        isLoading={applyMutation.isPending}
      />
    </div>
  );
};
