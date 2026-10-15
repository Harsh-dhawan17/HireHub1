import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { toast } from "../../store/useToastStore";
import {
  Briefcase,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  PlusCircle,
  FileText,
  Users,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { getInitials } from "../../lib/utils";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 font-semibold"
        : "text-slate-600 dark:text-slate-300"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent dark:from-white dark:to-slate-200">
              Hire<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <a href="/#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Features
              </a>
              <a href="/#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                How It Works
              </a>
              <a href="/#ai-resume" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Resume Parser
              </a>
              <a href="/#ats-checker" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                ATS Checker
              </a>
              <a href="/#testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Reviews
              </a>
            </>
          ) : (
            <>
              <NavLink to="/jobs" className={navLinkClass}>
                Browse Jobs
              </NavLink>

              {user?.role === "student" && (
                <>
                  <NavLink to="/student/applications" className={navLinkClass}>
                    My Applications
                  </NavLink>
                  <NavLink to="/student/resume-parser" className={navLinkClass}>
                    Resume Parser
                  </NavLink>
                </>
              )}

              {user?.role === "recruiter" && (
                <>
                  <NavLink to="/recruiter/jobs" className={navLinkClass}>
                    My Postings
                  </NavLink>
                  <NavLink to="/recruiter/applications" className={navLinkClass}>
                    Applicants
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Post a Job button for recruiter */}
          {isAuthenticated && user?.role === "recruiter" && (
            <Link to="/recruiter/jobs/create">
              <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                Post Job
              </Button>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {getInitials(user.fullname)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {user.fullname}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-20 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {user.fullname}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <Badge
                        variant={user.role === "recruiter" ? "purple" : "primary"}
                        size="sm"
                        className="mt-1.5 capitalize"
                      >
                        {user.role}
                      </Badge>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      {user.role === "student" && (
                        <>
                          <Link
                            to="/student/applications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            My Applications
                          </Link>
                          <Link
                            to="/student/resume-parser"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            Resume Parser
                          </Link>
                        </>
                      )}

                      {user.role === "recruiter" && (
                        <>
                          <Link
                            to="/recruiter/jobs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Manage Jobs
                          </Link>
                          <Link
                            to="/recruiter/applications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Users className="w-4 h-4 text-slate-400" />
                            Manage Applicants
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 space-y-4">
          <div className="flex flex-col space-y-3">
            {!isAuthenticated ? (
              <>
                <a
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  How It Works
                </a>
                <a
                  href="/#ai-resume"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  Resume Parser
                </a>
                <a
                  href="/#ats-checker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  ATS Checker
                </a>
                <a
                  href="/#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1"
                >
                  Reviews
                </a>
              </>
            ) : (
              <>
                <NavLink
                  to="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  Browse Jobs
                </NavLink>

                {user?.role === "student" && (
                  <>
                    <NavLink
                      to="/student/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass}
                    >
                      My Applications
                    </NavLink>
                    <NavLink
                      to="/student/resume-parser"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass}
                    >
                      Resume Parser
                    </NavLink>
                  </>
                )}

                {user?.role === "recruiter" && (
                  <>
                    <NavLink
                      to="/recruiter/jobs"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass}
                    >
                      My Posted Jobs
                    </NavLink>
                    <NavLink
                      to="/recruiter/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass}
                    >
                      Applicants Review
                    </NavLink>
                    <NavLink
                      to="/recruiter/jobs/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass}
                    >
                      Post a New Job
                    </NavLink>
                  </>
                )}
              </>
            )}

            {isAuthenticated && (
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                My Profile
              </NavLink>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated ? (
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                icon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
