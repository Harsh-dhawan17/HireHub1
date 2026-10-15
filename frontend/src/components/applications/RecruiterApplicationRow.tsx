import React, { useState } from "react";
import { Application, ApplicationApplicant, ApplicationStatus } from "../../types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { CandidateDetailsModal } from "./CandidateDetailsModal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { formatDate, getInitials } from "../../lib/utils";
import { CheckCircle2, XCircle, Mail, Clock, FileText, Eye, Sparkles } from "lucide-react";

interface RecruiterApplicationRowProps {
  application: Application;
  onUpdateStatus: (
    applicationId: string,
    status: ApplicationStatus
  ) => Promise<void>;
}

export const RecruiterApplicationRow: React.FC<RecruiterApplicationRowProps> = ({
  application,
  onUpdateStatus,
}) => {
  const [updating, setUpdating] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const applicant =
    typeof application.applicant === "object" && application.applicant !== null
      ? (application.applicant as ApplicationApplicant)
      : { fullname: "Applicant", email: "N/A" };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      setUpdating(true);
      await onUpdateStatus(application._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const hasResume = !!(application.resumeText || application.resumeFileName);
  const experienceCount = application.experienceAnswers?.length || 0;
  const atsScore = application.atsScore || 0;

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 transition-all shadow-sm">
        {/* Applicant info & Job applied to */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
            {getInitials(applicant.fullname)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {applicant.fullname}
              </h4>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {application.job?.title || "Role"}
              </span>

              {hasResume && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <FileText className="w-3 h-3" /> CV Attached
                </span>
              )}

              {atsScore > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3" /> {atsScore}% ATS
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <a
                href={`mailto:${applicant.email}`}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{applicant.email}</span>
              </a>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Applied {formatDate(application.createdAt)}</span>
              </div>
              {experienceCount > 0 && (
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  {experienceCount} requirements answered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <ApplicationStatusBadge status={application.status} />

          {/* View Details / CV Modal Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDetailsModalOpen(true)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Review CV & Profile
          </Button>

          <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
            {application.status !== "accepted" && (
              <Button
                size="sm"
                variant="outline"
                isLoading={updating}
                onClick={() => handleStatusChange("accepted")}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Accept
              </Button>
            )}

            {application.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                isLoading={updating}
                onClick={() => handleStatusChange("rejected")}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-800/80"
                icon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
            )}
          </div>
        </div>
      </div>

      <CandidateDetailsModal
        application={application}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onUpdateStatus={onUpdateStatus}
      />
    </>
  );
};
