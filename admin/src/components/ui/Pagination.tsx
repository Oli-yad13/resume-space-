import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination navigation"
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
          currentPage === 1
            ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400"
            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-zinc-400"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "min-w-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
              )}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
          currentPage === totalPages
            ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400"
            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
