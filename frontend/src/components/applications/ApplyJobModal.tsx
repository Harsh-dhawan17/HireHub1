import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Job, ExperienceAnswer, ApplyJobPayload } from "../../types";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Upload,
  FileText,
  X,
  User,
  Mail,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface ApplyJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ApplyJobPayload) => Promise<void>;
  isLoading: boolean;
}

const EXPERIENCE_OPTIONS = [
  "No professional experience",
  "Less than 1 year",
  "1 - 2 years",
  "2 - 3 years",
  "3 - 5 years",
  "5+ years",
];

type ModalStep = "cv" | "experience" | "review";

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const { user } = useAuthStore();

  const [step, setStep] = useState<ModalStep>("cv");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [useTextMode, setUseTextMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [experienceMap, setExperienceMap] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setStep("cv");
      setFile(null);
      setResumeText("");
      setUseTextMode(false);
      setPhoneNumber("");
      setCoverNote("");
      setExperienceMap({});
      setFormError("");
      setDragOver(false);
    }
  }, [isOpen]);

  if (!job) return null;

  const requirements = job.requirements || [];

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setFormError("File size exceeds 5MB limit");
        return;
      }
      setFile(selected);
      setFormError("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (dropped.size > 5 * 1024 * 1024) {
        setFormError("File size exceeds 5MB limit");
        return;
      }
      setFile(dropped);
      setFormError("");
    }
  };

  const handleExperienceChange = (skill: string, val: string) => {
    setExperienceMap((prev) => ({ ...prev, [skill]: val }));
  };

  // ── Step navigation ───────────────────────────────────────────────────────────

  const hasResume = file !== null || resumeText.trim().length > 20;

  const handleNextFromCV = () => {
    if (!hasResume) {
      setFormError("Please upload your CV/Resume or paste resume text to continue");
      return;
    }
    setFormError("");
    if (requirements.length > 0) {
      setStep("experience");
    } else {
      setStep("review");
    }
  };

  const handleNextFromExperience = () => {
    // All requirements should have an answer (defaulting is fine, just move on)
    setFormError("");
    setStep("review");
  };

  // ── Final submission ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasResume) {
      setFormError("CV/Resume is required");
      return;
    }

    setFormError("");

    const experienceAnswers: ExperienceAnswer[] = requirements.map((req) => ({
      skill: req,
      years: experienceMap[req] || "1 - 2 years",
    }));

    await onSubmit({
      resumeFile: file || undefined,
      resumeText: resumeText.trim() || undefined,
      phone: phoneNumber.trim(),
      coverNote: coverNote.trim(),
      experienceAnswers,
    });
  };

  const companyName =
    typeof job.company === "object" && job.company !== null
      ? job.company.fullname
      : "Company";

  // Progress steps
  const stepList: { key: ModalStep; label: string }[] = [
    { key: "cv", label: "Upload CV" },
    ...(requirements.length > 0 ? [{ key: "experience" as ModalStep, label: "Experience" }] : []),
    { key: "review", label: "Review & Send" },
  ];
  const stepIndex = stepList.findIndex((s) => s.key === step);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      description={`Submit your CV and details to ${companyName}`}
      maxWidth="lg"
    >
      <div className="mt-4 space-y-5">
        {/* Progress bar */}
        <div className="flex items-center gap-0">
          {stepList.map((s, i) => {
            const isDone = i < stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 font-semibold whitespace-nowrap ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isDone
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stepList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 mb-4 transition-all duration-500 ${
                      i < stepIndex ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {/* ── STEP 1: UPLOAD CV ─────────────────────────────────────── */}
        {step === "cv" && (
          <div className="space-y-4">
            {/* Candidate Info Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-semibold">{user?.fullname || "Candidate"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="truncate">{user?.email || ""}</span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <input
                  type="tel"
                  placeholder="Contact phone number (e.g. +1 555-019-2834)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Your CV / Resume <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseTextMode(!useTextMode);
                    setFile(null);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {useTextMode ? "Upload File instead" : "Paste Text instead"}
                </button>
              </div>

              {!useTextMode ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
                    file
                      ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : dragOver
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.01]"
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/40"
                  }`}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB · Ready to submit
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="resume-file-input"
                      className="flex flex-col items-center cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to browse or drag & drop your CV
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, DOC, TXT, MD · Max 5MB</p>
                    </label>
                  )}
                </div>
              ) : (
                <textarea
                  rows={5}
                  placeholder="Paste your resume or CV text content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              )}
            </div>

            {/* Note to recruiter (in this step too) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Note / Pitch to Recruiter <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Briefly say why you're a great fit for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {/* Next button — only enabled when CV is provided */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleNextFromCV}
                disabled={!hasResume}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                {requirements.length > 0 ? "Next: Experience" : "Review Application"}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: EXPERIENCE QUESTIONS ──────────────────────────── */}
        {step === "experience" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Years of Experience by Skill
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  The recruiter will see your self-assessed experience for each requirement
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {requirements.map((req) => (
                <div
                  key={req}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0" />
                    {req}
                  </span>
                  <select
                    value={experienceMap[req] || "1 - 2 years"}
                    onChange={(e) => handleExperienceChange(req, e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("cv")}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleNextFromExperience}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Review Application
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW & SEND ──────────────────────────────────── */}
        {step === "review" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Application Summary
              </p>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullname}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {file ? file.name : "Pasted resume text"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB · CV attached`
                      : `${resumeText.length} characters of resume text`}
                  </p>
                </div>
              </div>

              {requirements.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Experience Answers ({requirements.length} skill{requirements.length > 1 ? "s" : ""}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {requirements.map((req) => (
                      <span
                        key={req}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {req}: <span className="text-indigo-600 dark:text-indigo-400">{experienceMap[req] || "1 - 2 years"}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {coverNote && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">Your Note:</p>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2">
                    "{coverNote}"
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              By submitting, your CV and application details will be shared with the recruiter at{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{companyName}</span>.
            </p>

            <div className="flex justify-between items-center pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(requirements.length > 0 ? "experience" : "cv")}
                icon={<ChevronLeft className="w-4 h-4" />}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="md"
                isLoading={isLoading}
                icon={!isLoading ? <Sparkles className="w-4 h-4" /> : undefined}
              >
                Submit Application & CV
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
