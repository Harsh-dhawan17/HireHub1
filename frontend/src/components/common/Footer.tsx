import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Heart, Globe, Mail, Share2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Hire<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering candidates to land dream opportunities and companies to build world-class teams with seamless hiring workflows.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Globe className="w-4 h-4" />
              </span>
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Share2 className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              For Job Seekers
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/jobs" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Explore Jobs
                </Link>
              </li>
              <li>
                <Link to="/student/applications" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Application Status
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Candidate Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              For Recruiters
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/recruiter/jobs/create" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Post a Vacancy
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link to="/recruiter/applications" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Candidate Applications
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform Features
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Real-time Applicant Review
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Secure Cookie-based Auth
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Role-Based Access Control
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} HireHub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern hiring
          </p>
        </div>
      </div>
    </footer>
  );
};
