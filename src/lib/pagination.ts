/** Rows-per-page choices for every paginated list in the app. */
export const PAGE_SIZE_OPTIONS = [100, 200, 500, 1000] as const;
export const DEFAULT_PAGE_SIZE: number = PAGE_SIZE_OPTIONS[0];
