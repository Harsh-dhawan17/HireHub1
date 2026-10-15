import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Application } from "../../types";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import {
  MapPin,
  Banknote,
  Calendar,
  ChevronRight,
  Briefcase,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";

export const StudentApplicationCard: React.FC<{ application: Application }> = ({
  application,
}) => {
  const { job, status, createdAt, resumeFileName, experienceAnswers, atsScore } = application;
  const [showDetails, setShowDetails] = useState(false);

  const hasExtras =
    (experienceAnswers && experienceAnswers.length > 0) ||
    resumeFileName ||
    (atsScore && atsScore > 0);

  return (
    <Card hoverEffect className="p-5 sm:p-6 flex flex-col gap-4">
      {/* Main row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/jobs/${job._id}`}
                className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors"
              >
                {job.title}
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied on {formatDate(createdAt)}</span>
              </div>
            </div>

            {/* CV file badge */}
            {resumeFileName && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/60">
                  {resumeFileName}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {atsScore && atsScore > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  ATS {atsScore}%
                </span>
              </div>
            ) : null}
            <ApplicationStatusBadge status={status} />
          </div>
          <Link
            to={`/jobs/${job._id}`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View Job <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Expandable details */}
      {hasExtras && (
        <div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            {showDetails ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Hide application details</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> View application details</>
            )}
          </button>

          {showDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
              {experienceAnswers && experienceAnswers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Your Experience Answers
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {experienceAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ans.skill}</span>: {ans.years}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
