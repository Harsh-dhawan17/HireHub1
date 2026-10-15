import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {totalItems !== undefined && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</span> to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="text-slate-400 px-1 text-xs">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="flex items-center gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </div>
  );
};
