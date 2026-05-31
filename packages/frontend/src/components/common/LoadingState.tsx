import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export interface LoadingStateProps {
  fullPage?: boolean;
  rowCount?: number;
}

export function LoadingState({
  fullPage = false,
  rowCount = 3,
}: LoadingStateProps) {
  if (fullPage) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: rowCount }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
