import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Brain,
  Search,
  Zap,
  Building2,
  Users2,
  GraduationCap,
  Star,
  ChevronRight,
  FileText,
  Clock,
  Code2,
  Compass,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"candidate" | "recruiter">("candidate");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (locationQuery) params.set("location", locationQuery);

    if (isAuthenticated) {
      navigate(`/jobs?${params.toString()}`);
    } else {
      navigate(`/login?from=/jobs?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ── Authenticated User Welcome Ribbon ────────────────────────── */}
      {isAuthenticated && user && (
        <section className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs sm:text-sm font-medium">
                Welcome back, <span className="font-bold">{user.fullname}</span>! You are logged in as a{" "}
                <span className="capitalize underline decoration-indigo-300 font-semibold">{user.role}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user.role === "student" ? (
                <>
                  <Link to="/jobs">
                    <Button size="sm" className="bg-white text-indigo-700 hover:bg-slate-100 shadow-sm text-xs py-1.5 h-8">
                      Search Jobs
                    </Button>
                  </Link>
                  <Link to="/student/resume-parser">
                    <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-xs py-1.5 h-8">
                      AI Resume Parser
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/recruiter/jobs">
                    <Button size="sm" className="bg-white text-indigo-700 hover:bg-slate-100 shadow-sm text-xs py-1.5 h-8">
                      Manage Jobs
                    </Button>
                  </Link>
                  <Link to="/recruiter/jobs/create">
                    <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-xs py-1.5 h-8">
                      Post New Vacancy
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Next-Generation Career Platform & AI ATS Engine</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-[10px] font-bold">
              v2.0
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight sm:leading-tight">
            Connect With Opportunities That{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300">
              Define Your Career
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The intelligent hiring ecosystem designed for developers and modern tech teams. Analyze your resume with AI, check enterprise ATS compatibility scores, and land verified roles in record time.
          </p>

          {/* Search Form Preview */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title, technology (e.g. React, Node.js, Python)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="h-px sm:h-auto sm:w-px bg-slate-200 dark:bg-slate-800 my-1 sm:my-0" />

              <div className="flex-1 relative flex items-center">
                <Compass className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <Button type="submit" size="md" className="shrink-0 px-7 shadow-lg shadow-indigo-600/25">
                {isAuthenticated ? "Search Jobs" : "Find Jobs"}
              </Button>
            </form>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In to Account
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/jobs">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Active Vacancies
                </Button>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified Job Listings
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-500" /> AI-Powered ATS Scanner
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> 1-Click Fast Apply
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-violet-500" /> 24-Hour Recruiter Feedback
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. METRICS & STATISTICS BAR ───────────────────────────── */}
      <section className="py-10 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">10,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Tech Candidates Placed</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-violet-600 dark:text-violet-400">98.4%</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">ATS Accuracy Rate</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">500+</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Hiring Tech Companies</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-500 dark:text-amber-400">&lt; 24h</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">Average Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION ───────────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Complete Career Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything Candidates & Recruiters Need to Succeed
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built from scratch to eliminate recruitment friction, broken applicant tracking systems, and endless waiting periods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Powered ATS Compatibility</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Match your resume against any job description with real-time scoring, detected technical competencies, missing keywords, and tailored suggestions.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">1-Click Instant Applications</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Never re-type your personal info or employment history. Registered candidates can apply to verified tech openings in a single click.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Application Tracker</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Complete transparency. View exact hiring statuses (Under Review, Accepted, Rejected) updated directly by decision-makers.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recruiter Candidate Pipeline</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Post positions in seconds, filter candidates by score, review applicant resumes, and update recruitment status with one click.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Extraction Engine</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload PDF or text resumes to instantly detect 60+ technical programming languages, frameworks, cloud platforms, and tooling competencies.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Direct Recruiter Outreach</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No third-party headhunters or blind inboxes. Communicate directly with corporate talent acquisition teams and founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS SECTION ───────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              How HireHub Accelerates Hiring
            </h2>
            <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab("candidate")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "candidate"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                For Job Seekers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recruiter")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "recruiter"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                For Recruiters & Companies
              </button>
            </div>
          </div>

          {activeTab === "candidate" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">01</span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Your Free Profile</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign up in under 60 seconds with your email and contact info. Your profile stays confidential and secure.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">02</span>
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold mb-6">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan Resume & Optimize ATS</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Run your resume through our AI ATS evaluator to identify missing keywords and ensure you pass corporate screening filters.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">03</span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply & Track Status</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submit 1-click applications to verified roles and receive real-time notifications on interview selections.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">01</span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register as Recruiter</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Join with your company profile to publish vacancies and access modern pipeline management tools immediately.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">02</span>
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold mb-6">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish Tech Vacancies</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Specify skill prerequisites, salary packages, experience criteria, and role responsibilities in a seamless form.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 relative">
                <span className="text-5xl font-black text-indigo-200 dark:text-indigo-950 absolute top-6 right-6">03</span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-6">
                  <Users2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review & Hire Talent</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Evaluate applicants with pre-screened skills, accept candidate profiles with a single click, and accelerate onboarding.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. AI RESUME PARSER SHOWCASE ─────────────────────────── */}
      <section id="ai-resume" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
                <Brain className="w-3.5 h-3.5" />
                <span>Next-Gen NLP & Gemini Parsing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Instant Skill & Contact Information Extraction
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Our parser scans complex PDF resumes, removes formatting noise, and extracts structured technical competencies, emails, phone numbers, and experience metrics in milliseconds.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Supports multi-page PDF documents, Markdown, and plaintext</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cross-references 60+ industry-standard tech stack taxonomies</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero data leakage — candidate text is processed securely</span>
                </li>
              </ul>
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link to="/student/resume-parser">
                    <Button icon={<ArrowRight className="w-4 h-4" />}>
                      Try Resume Parser Now
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button icon={<ArrowRight className="w-4 h-4" />}>
                      Create Account to Parse Resume
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Interactive Visual Showcase Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Alex_Chen_Senior_FullStack.pdf</p>
                    <p className="text-xs text-slate-400">PDF Document • 42 KB</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Parsed Successfully
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">14 Skills</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Detected</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-base font-extrabold text-violet-600 dark:text-violet-400">alex@chen.dev</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Contact Email</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">540 Words</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Content</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Detected Tech Competencies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["React.js", "TypeScript", "Node.js", "Tailwind CSS", "MongoDB", "PostgreSQL", "Docker", "AWS", "REST APIs", "GraphQL", "Git"].map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. ATS COMPATIBILITY CHECKER SHOWCASE ─────────────────── */}
      <section id="ats-checker" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual ATS Evaluation Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 shadow-xl space-y-6 order-2 lg:order-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Evaluated Against</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Senior Full-Stack Engineer • TechCorp</p>
                </div>
                <Badge variant="success" size="md">Strong Match</Badge>
              </div>

              {/* Score Indicator */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">92%</p>
                  <p className="text-xs text-slate-500 font-medium">ATS Match Score</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    High probability of passing recruiter screening
                  </p>
                </div>
              </div>

              {/* Matched vs Missing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Matched (6)
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"].map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs mb-2">
                    <XCircle className="w-4 h-4" /> Missing (1)
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                      Kubernetes
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50">
                <p className="text-xs font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> AI Optimization Suggestion
                </p>
                <p className="text-xs text-violet-800 dark:text-violet-300 leading-relaxed">
                  Mention hands-on container orchestration (Kubernetes/EKS) and quantify system latency or throughput gains to push your score above 95%.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise ATS Algorithm</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Beat the Screening Robots Before a Human Even Looks
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                75% of qualified resumes are discarded by corporate applicant tracking systems due to keyword mismatches. HireHub’s ATS matcher simulates actual hiring software algorithms to show you exactly how recruiters evaluate your profile.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Dynamic match score calculated against any custom or live job posting</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Highlights critical technology overlaps and prerequisite deficits</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                  <span>Actionable resume phrasing suggestions powered by Gemini AI</span>
                </div>
              </div>
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link to="/student/resume-parser">
                    <Button icon={<ArrowRight className="w-4 h-4" />}>
                      Run ATS Matcher
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button icon={<ArrowRight className="w-4 h-4" />}>
                      Sign Up & Test Your Resume
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS & USER REVIEWS ────────────────────────── */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              User Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Loved by Engineers and Talent Leads
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              See how developers landed their dream roles and companies scaled engineering teams using HireHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "The ATS match score told me exactly why I wasn't getting callbacks. I tweaked my skills section as suggested and landed 3 interviews within a week. Now working as a Senior React Engineer!"
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  SP
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Siddharth Patel</p>
                  <p className="text-xs text-slate-400">Frontend Engineer @ FinTech</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "As a tech recruiter, reviewing 400 applicants was overwhelming. HireHub's pre-extracted candidate skills and clean statuses cut our screening time by over 60%. Highly recommended!"
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-pink-600 text-white font-bold text-xs flex items-center justify-center">
                  MR
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Maya Reynolds</p>
                  <p className="text-xs text-slate-400">Head of Talent @ CloudScale</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "Applying to jobs is usually a black hole. With HireHub's live application tracker, I actually saw when the recruiter reviewed my profile and accepted my application. Zero ghosting!"
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  DK
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">David Kim</p>
                  <p className="text-xs text-slate-400">Full-Stack Developer @ SaaS AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CALL TO ACTION BANNER ──────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Take Your Next Career Leap?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto">
            Join thousands of developers and top tech hiring companies collaborating on HireHub today. Free for job seekers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 shadow-xl px-8">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : user?.role === "recruiter" ? (
              <Link to="/recruiter/jobs/create">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 shadow-xl px-8">
                  Post a Job Opening
                </Button>
              </Link>
            ) : (
              <Link to="/jobs">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 shadow-xl px-8">
                  Explore Open Jobs
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
