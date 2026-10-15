import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { Application, ApplicationApplicant, ApplicationStatus } from "../../types";
import { formatDate } from "../../lib/utils";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Download,
} from "lucide-react";
import { toast } from "../../store/useToastStore";

interface CandidateDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (applicationId: string, status: ApplicationStatus) => Promise<void>;
}

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [showFullResume, setShowFullResume] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!application) return null;

  const applicant =
    typeof application.applicant === "object" && application.applicant !== null
      ? (application.applicant as ApplicationApplicant)
      : { fullname: "Applicant", email: "", phone: "" };

  const experienceAnswers = application.experienceAnswers || [];
  const resumeText = application.resumeText || "";
  const resumeFileName = application.resumeFileName || "Candidate_CV.pdf";
  const phone = application.phone || applicant.phone || "Not provided";
  const coverNote = application.coverNote || "";
  const matchDetails = application.matchDetails;
  const atsScore = application.atsScore || 0;

  const handleCopyResume = () => {
    if (resumeText) {
      navigator.clipboard.writeText(resumeText);
      toast.success("Resume text copied to clipboard");
    }
  };

  const handleDownloadResume = () => {
    if (!resumeText) return;
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = resumeFileName.endsWith(".txt") ? resumeFileName : `${resumeFileName.replace(/\.[^.]+$/, "")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CV downloaded successfully");
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!onUpdateStatus) return;
    try {
      setUpdating(true);
      await onUpdateStatus(application._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidate Profile: ${applicant.fullname}`}
      description={`Applied for ${application.job?.title || "Position"}`}
      size="xl"
    >
      <div className="space-y-6 mt-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {applicant.fullname}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {applicant.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {phone}
                </span>
              </div>
            </div>
          </div>

          {/* Status Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1">
              {(["pending", "accepted", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  disabled={updating}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    application.status === st
                      ? st === "accepted"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : st === "rejected"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-amber-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ATS Score & Match Overview if available */}
        {atsScore > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                {atsScore}%
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Automated ATS Match Analysis
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {matchDetails?.summary || "Candidate competencies evaluated against job requirements"}
                </p>
              </div>
            </div>
            {matchDetails?.matchedSkills && matchDetails.matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px]">
                {matchDetails.matchedSkills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience Questionnaire Responses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Candidate Experience by Requirement
            </h4>
          </div>

          {experienceAnswers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {experienceAnswers.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {ans.skill}
                  </span>
                  <Badge variant="purple" size="sm">
                    {ans.years}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400">
              No specific requirement questions were answered for this application.
            </div>
          )}
        </div>

        {/* Candidate Cover Note */}
        {coverNote && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Candidate Note / Pitch
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{coverNote}"
            </div>
          </div>
        )}

        {/* Candidate CV / Resume Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Submitted CV / Resume Document
              </h4>
            </div>
            {resumeText && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyResume}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download CV
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {resumeFileName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Uploaded on {formatDate(application.createdAt)}
                </p>
              </div>
            </div>

            {resumeText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullResume(!showFullResume)}
                icon={<ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullResume ? "rotate-180" : ""}`} />}
              >
                {showFullResume ? "Hide CV Text" : "View CV Content"}
              </Button>
            )}
          </div>

          {showFullResume && resumeText && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {resumeText}
              </p>
            </div>
          )}

          {!resumeText && (
            <p className="text-xs text-slate-400 italic">
              No parsed resume text available for this submission.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Profile
        </Button>
      </div>
    </Modal>
  );
};
