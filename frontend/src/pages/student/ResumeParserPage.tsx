import React, { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jobApi } from "../../api/job.api";
import { aiApi } from "../../api/ai.api";
import { toast } from "../../store/useToastStore";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import type { AtsEvaluation, Job, ParsedResume } from "../../types";
import {
  Upload, FileText, Sparkles, CheckCircle2, XCircle, TrendingUp,
  AlertTriangle, Zap, Brain, Search, BarChart2, ChevronDown, X,
  RefreshCw, Info, Star, Lightbulb, Briefcase,
} from "lucide-react";

// ── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge: React.FC<{ score: number; rating: string }> = ({ score, rating }) => {
  const clamp = Math.min(100, Math.max(0, score));
  const angle = (clamp / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 100; const cy = 100; const r = 80;
  const x = cx + r * Math.cos(Math.PI - rad);
  const y = cy - r * Math.sin(Math.PI - rad);
  const color = clamp >= 75 ? "#10b981" : clamp >= 50 ? "#f59e0b" : "#ef4444";
  const bgArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fgArc = angle === 0 ? "" : `M ${cx - r} ${cy} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x} ${y}`;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="35 20 130 85" className="w-52 h-28">
        <path d={bgArc} fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" className="text-slate-200 dark:text-slate-700" />
        {fgArc && <path d={fgArc} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" style={{ transition: "all 1s ease" }} />}
        <line x1={cx} y1={cy} x2={cx + (r - 8) * Math.cos(Math.PI - rad)} y2={cy - (r - 8) * Math.sin(Math.PI - rad)} stroke={color} strokeWidth="3" strokeLinecap="round" style={{ transition: "all 1s ease" }} />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>{clamp}%</text>
      </svg>
      <span className={`text-sm font-bold mt-1 ${clamp >= 75 ? "text-emerald-500" : clamp >= 50 ? "text-amber-500" : "text-red-500"}`}>{rating}</span>
    </div>
  );
};

// ── Skill Pill ───────────────────────────────────────────────────────────────
const SkillPill: React.FC<{ label: string; matched: boolean }> = ({ label, matched }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${matched ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"}`}>
    {matched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    {label}
  </span>
);

// ── Drop Zone ────────────────────────────────────────────────────────────────
const DropZone: React.FC<{ file: File | null; onFile: (f: File) => void; onClear: () => void }> = ({ file, onFile, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }, [onFile]);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${dragging ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.01]" : file ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 cursor-default" : "border-slate-300 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="flex items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200 text-center">Drag and drop your resume here</p>
          <p className="text-xs text-slate-400 mt-1 text-center">Supports PDF, TXT, MD - Max 5 MB</p>
          <button type="button" className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Browse Files</button>
        </>
      )}
    </div>
  );
};

// ── ATS Results Panel ────────────────────────────────────────────────────────
const AtsResultsPanel: React.FC<{ evaluation: AtsEvaluation; excerpt: string; onReset: () => void }> = ({ evaluation, excerpt, onReset }) => (
  <div className="space-y-6">
    {evaluation.isAiPowered && (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800 w-fit">
        <Brain className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">AI-Powered Analysis by Gemini</span>
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
      </div>
    )}
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge score={evaluation.atsScore} rating={evaluation.matchRating} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ATS Compatibility Score</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{evaluation.summary}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Matched", val: evaluation.matchedSkills.length, color: "text-emerald-500" },
              { label: "Missing", val: evaluation.missingSkills.length, color: "text-red-500" },
              { label: "ATS Score", val: `${evaluation.atsScore}%`, color: "text-indigo-500" },
            ].map((s) => (
              <div key={s.label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-lg font-extrabold ${s.color}`}>{s.val}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Matched Skills</h4>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-semibold">{evaluation.matchedSkills.length}</span>
        </div>
        {evaluation.matchedSkills.length > 0
          ? <div className="flex flex-wrap gap-2">{evaluation.matchedSkills.map((s) => <SkillPill key={s} label={s} matched />)}</div>
          : <p className="text-xs text-slate-400">No matched skills detected.</p>}
      </div>
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Missing Skills</h4>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold">{evaluation.missingSkills.length}</span>
        </div>
        {evaluation.missingSkills.length > 0
          ? <div className="flex flex-wrap gap-2">{evaluation.missingSkills.map((s) => <SkillPill key={s} label={s} matched={false} />)}</div>
          : <p className="text-xs text-slate-400">All required skills are present!</p>}
      </div>
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      {evaluation.strengths.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-amber-400" /><h4 className="text-sm font-bold text-slate-900 dark:text-white">Your Strengths</h4></div>
          <ul className="space-y-2">{evaluation.strengths.map((s, i) => <li key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300"><TrendingUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{s}</li>)}</ul>
        </div>
      )}
      {evaluation.improvements.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-5 h-5 text-violet-500" /><h4 className="text-sm font-bold text-slate-900 dark:text-white">Improvements</h4></div>
          <ul className="space-y-2">{evaluation.improvements.map((imp, i) => <li key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />{imp}</li>)}</ul>
        </div>
      )}
    </div>
    {excerpt && (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 mb-3"><Info className="w-4 h-4 text-slate-400" /><h4 className="text-xs font-semibold text-slate-500 uppercase">Resume Excerpt (first 300 chars)</h4></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">{excerpt}</p>
      </div>
    )}
    <div className="flex justify-center pt-2">
      <Button variant="outline" onClick={onReset} icon={<RefreshCw className="w-4 h-4" />}>Analyze Another Resume</Button>
    </div>
  </div>
);

// ── Parse Results Panel ──────────────────────────────────────────────────────
const ParseResultsPanel: React.FC<{ parsed: ParsedResume; resumeText: string; onReset: () => void }> = ({ parsed, resumeText, onReset }) => {
  const [showFull, setShowFull] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Skills Found", value: parsed.detectedSkills.length, color: "text-indigo-500" },
          { label: "Word Count", value: parsed.wordCount, color: "text-violet-500" },
          { label: "Characters", value: parsed.characterCount, color: "text-blue-500" },
          { label: "Email", value: parsed.email ? "Detected" : "Not Found", color: parsed.email ? "text-emerald-500" : "text-slate-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center shadow-sm">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      {(parsed.email || parsed.phone) && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Extracted Contact Info</h4>
          <div className="space-y-1.5">
            {parsed.email && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-slate-200">Email:</span> {parsed.email}</p>}
            {parsed.phone && <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-slate-200">Phone:</span> {parsed.phone}</p>}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Detected Technical Skills</h4>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold">{parsed.detectedSkills.length}</span>
        </div>
        {parsed.detectedSkills.length > 0
          ? <div className="flex flex-wrap gap-2">{parsed.detectedSkills.map((skill) => <span key={skill} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 text-xs font-semibold">{skill}</span>)}</div>
          : <p className="text-xs text-slate-400">No common tech skills detected.</p>}
      </div>
      {resumeText && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
          <button onClick={() => setShowFull(!showFull)} className="flex items-center justify-between w-full text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2"><FileText className="w-4 h-4" />Extracted Resume Text</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFull ? "rotate-180" : ""}`} />
          </button>
          {showFull && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">{resumeText}</p>}
        </div>
      )}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onReset} icon={<RefreshCw className="w-4 h-4" />}>Parse Another Resume</Button>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
type Mode = "ats" | "parse";

export const ResumeParserPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("ats");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [atsResult, setAtsResult] = useState<{ evaluation: AtsEvaluation; excerpt: string } | null>(null);
  const [parseResult, setParseResult] = useState<{ parsed: ParsedResume; resumeText: string } | null>(null);

  const [jobSelectionMode, setJobSelectionMode] = useState<"platform" | "custom">("platform");
  const [customTitle, setCustomTitle] = useState("");
  const [customRequirements, setCustomRequirements] = useState("");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobApi.getAllJobs,
    enabled: mode === "ats",
  });

  const atsMutation = useMutation({
    mutationFn: () => {
      if (jobSelectionMode === "custom" && (customTitle.trim() || customRequirements.trim())) {
        const reqList = customRequirements
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
        return aiApi.matchResume({
          file: file ?? undefined,
          resumeText: resumeText || undefined,
          title: customTitle.trim() || "Software Engineer",
          requirements: reqList,
        });
      }
      return aiApi.matchResume({
        file: file ?? undefined,
        resumeText: resumeText || undefined,
        jobId: selectedJobId || undefined,
      });
    },
    onSuccess: (data) => {
      setAtsResult({ evaluation: data.evaluation, excerpt: data.resumeExcerpt });
      toast.success("ATS analysis complete!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "ATS analysis failed");
    },
  });

  const parseMutation = useMutation({
    mutationFn: () => aiApi.parseResume({ file: file ?? undefined, resumeText: resumeText || undefined }),
    onSuccess: (data) => { setParseResult({ parsed: data.parsed, resumeText: data.resumeText }); toast.success("Resume parsed successfully!"); },
    onError: (err: Error) => { toast.error(err.message || "Resume parsing failed"); },
  });

  const handleSubmit = () => {
    if (!file && !resumeText.trim()) { toast.error("Please upload a resume file or paste resume text"); return; }
    if (mode === "ats") atsMutation.mutate(); else parseMutation.mutate();
  };

  const handleReset = () => {
    setAtsResult(null);
    setParseResult(null);
    setFile(null);
    setResumeText("");
    setSelectedJobId("");
    setCustomTitle("");
    setCustomRequirements("");
  };

  const isBusy = atsMutation.isPending || parseMutation.isPending;
  const hasResult = atsResult || parseResult;
  const selectedJob = (jobs as Job[]).find((j) => j._id === selectedJobId);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800 mb-5">
          <Brain className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">AI-Powered Resume Intelligence</span>
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Resume Parser{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{"& ATS Match"}</span>
        </h1>
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Upload your resume to check ATS compatibility against a job posting, or extract skills and contact information instantly.
        </p>
      </div>

      <div className="flex p-1 mb-8 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 gap-1">
        {([
          { key: "ats" as Mode, label: "ATS Match", Icon: BarChart2 },
          { key: "parse" as Mode, label: "Resume Parser", Icon: Search },
        ]).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => { if (!hasResult && !isBusy) setMode(key); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === key ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {!hasResult ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />Upload Resume
            </h2>
            <DropZone file={file} onFile={setFile} onClear={() => setFile(null)} />
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-semibold text-slate-400">OR PASTE TEXT</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={!!file}
              placeholder={file ? "Clear the uploaded file to paste text instead" : "Paste your resume content here..."}
              rows={6}
              className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none disabled:opacity-40 disabled:cursor-not-allowed transition"
            />
          </div>

          {mode === "ats" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Select Target Job Position
                  <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
                </h2>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setJobSelectionMode("platform")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      jobSelectionMode === "platform"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Platform Jobs
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobSelectionMode("custom")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      jobSelectionMode === "custom"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Custom Role
                  </button>
                </div>
              </div>

              {jobSelectionMode === "platform" ? (
                <>
                  {jobsLoading ? (
                    <LoadingSpinner text="Loading jobs..." />
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-10 transition"
                      >
                        <option value="">General analysis (no specific job)</option>
                        {(jobs as Job[]).map((job) => (
                          <option key={job._id} value={job._id}>
                            {job.title} - {job.location} - {typeof job.company === "object" ? job.company.fullname : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                  {selectedJob && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedJob.requirements.map((r) => (
                        <span key={r} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  {!selectedJobId && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Without a specific job, the system will perform a general skill compatibility analysis.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Target Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Full-Stack Engineer, React Developer"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Required Skills & Keywords (comma or newline separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <Button size="lg" onClick={handleSubmit} isLoading={isBusy} disabled={isBusy || (!file && !resumeText.trim())}
              icon={isBusy ? undefined : mode === "ats" ? <BarChart2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              className="px-10">
              {isBusy
                ? (mode === "ats" ? "Analyzing ATS Compatibility..." : "Parsing Resume...")
                : (mode === "ats" ? "Run ATS Match Analysis" : "Parse My Resume")}
            </Button>
          </div>
        </div>
      ) : atsResult ? (
        <AtsResultsPanel evaluation={atsResult.evaluation} excerpt={atsResult.excerpt} onReset={handleReset} />
      ) : parseResult ? (
        <ParseResultsPanel parsed={parseResult.parsed} resumeText={parseResult.resumeText} onReset={handleReset} />
      ) : null}
    </div>
  );
};
