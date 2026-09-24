import type { UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Renders a loading or error state for a query, or `children` with the data.
 *   <QueryState query={chainsQuery}>{(chains) => <DataTable data={chains} … />}</QueryState>
 */
export function QueryState<T>({
  query,
  children,
  label = "data",
}: {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  label?: string;
}) {
  if (query.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading {label}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4" /> Could not load {label}: {query.error.message}
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>Retry</Button>
      </div>
    );
  }
  return <>{children(query.data)}</>;
}
