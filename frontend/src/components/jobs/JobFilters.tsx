import React from "react";
import { Search, MapPin, SlidersHorizontal, RotateCcw } from "lucide-react";
import { JobType, ExperienceLevel } from "../../types";

export interface FilterState {
  search: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  sortBy: "newest" | "salary-desc" | "salary-asc" | "positions-desc";
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const jobTypeOptions: { label: string; value: string }[] = [
    { label: "All Job Types", value: "" },
    { label: "Full Time", value: "full-time" },
    { label: "Part Time", value: "part-time" },
    { label: "Internship", value: "internship" },
    { label: "Contract", value: "contract" },
  ];

  const experienceOptions: { label: string; value: string }[] = [
    { label: "All Experience Levels", value: "" },
    { label: "Fresher", value: "fresher" },
    { label: "1-3 Years", value: "1-3 years" },
    { label: "3-5 Years", value: "3-5 years" },
    { label: "5+ Years", value: "5+ years" },
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Salary: High to Low", value: "salary-desc" },
    { label: "Salary: Low to High", value: "salary-asc" },
    { label: "Most Openings", value: "positions-desc" },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.jobType ||
    filters.experienceLevel ||
    filters.sortBy !== "newest";

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90 space-y-4">
      {/* Search Input and Location */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-7 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title, skills, or company..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        <div className="md:col-span-5 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="City or location..."
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Dropdown Filters and Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
            Job Type
          </label>
          <select
            value={filters.jobType}
            onChange={(e) =>
              onChange({
                ...filters,
                jobType: e.target.value as JobType | "",
              })
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {jobTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
            Experience Level
          </label>
          <select
            value={filters.experienceLevel}
            onChange={(e) =>
              onChange({
                ...filters,
                experienceLevel: e.target.value as ExperienceLevel | "",
              })
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {experienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterState["sortBy"],
              })
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-between gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 py-2 ml-auto shrink-0">
            Found <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalResults}</span> vacancies
          </div>
        </div>
      </div>
    </div>
  );
};
