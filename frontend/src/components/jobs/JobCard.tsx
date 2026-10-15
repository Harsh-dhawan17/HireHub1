import React from "react";
import { Link } from "react-router-dom";
import { Job, JobCompany } from "../../types";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { useAuthStore } from "../../store/useAuthStore";
import {
  MapPin,
  Banknote,
  Clock,
  Building2,
  Users,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  formatCurrency,
  formatRelativeTime,
  getJobTypeColor,
} from "../../lib/utils";

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
  onApply?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  hasApplied = false,
  onApply,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  const companyName =
    typeof job.company === "object" && job.company !== null
      ? (job.company as JobCompany).fullname || "Partner Company"
      : "Partner Company";

  const isOwner =
    isAuthenticated &&
    user?.role === "recruiter" &&
    (typeof job.company === "object" && job.company !== null
      ? (job.company as JobCompany)._id === user._id
      : job.company === user?._id);

  return (
    <Card hoverEffect className="flex flex-col justify-between group">
      <div>
        {/* Top Header: Company & Badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 text-base shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                {companyName}
              </span>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getJobTypeColor(
                job.jobType
              )}`}
            >
              {job.jobType}
            </span>
          </div>
        </div>

        {/* Job Metadata Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(job.salary)}/yr
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{job.position} {job.position === 1 ? "Opening" : "Openings"}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Requirements / Tags */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {job.requirements.slice(0, 4).map((req, idx) => (
              <Badge key={idx} variant="default" size="sm">
                {req}
              </Badge>
            ))}
            {job.requirements.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{job.requirements.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(job.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <Link to={`/recruiter/jobs/edit/${job._id}`}>
              <Button size="sm" variant="outline">
                Edit Posting
              </Button>
            </Link>
          ) : user?.role === "student" && onApply ? (
            <Button
              size="sm"
              variant={hasApplied ? "secondary" : "primary"}
              disabled={hasApplied}
              onClick={onApply}
              icon={!hasApplied ? <FileText className="w-3.5 h-3.5" /> : undefined}
            >
              {hasApplied ? "Applied ✓" : "Apply + CV"}
            </Button>
          ) : null}

          <Link to={`/jobs/${job._id}`}>
            <Button size="sm" variant="ghost" className="px-2">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
