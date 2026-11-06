import { Skeleton } from "@/components/ui/skeleton";

export function SessionCardSkeleton() {
  return (
    <div className="border-border bg-card rounded-xl border p-5">
      <Skeleton className="size-12" />
      <Skeleton className="mt-5 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-6 h-4 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <Skeleton className="mt-6 h-8 w-full" />
    </div>
  );
}
