import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, isLoading = false, onPageChange }: PaginationProps) {
  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Pagination"
      aria-busy={isLoading}
    >
      <Button
        variant="outline"
        size="icon"
        disabled={isLoading || page <= 1}
        aria-label="Page précédente"
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      <span
        className="text-muted-foreground flex min-w-28 items-center justify-center gap-2 text-sm"
        aria-live="polite"
      >
        {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : null}
        Page {page} sur {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={isLoading || page >= totalPages}
        aria-label="Page suivante"
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
