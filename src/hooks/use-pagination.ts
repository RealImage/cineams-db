import { useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

/**
 * Client-side pagination over an already searched/filtered list.
 * Pass the FILTERED items so search and filters apply across all pages;
 * the page resets to 1 whenever `resetKey` changes (e.g. the search term or
 * filters) and is clamped if the list shrinks.
 */
export function usePagination<T>(items: T[], resetKey?: unknown) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return { page: currentPage, setPage, pageSize, setPageSize, totalPages, totalItems: items.length, pageItems };
}
