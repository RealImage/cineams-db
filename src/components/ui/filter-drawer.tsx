import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { common } from "@/i18n/common";

/**
 * The one filter surface for every list page: a right-hand overlay panel
 * (Qube DS "Filter Drawer"). Edits happen on a draft; nothing applies until
 * "Apply filters". "Clear all" resets the draft and applies immediately.
 *
 *   const [open, setOpen] = useState(false);
 *   const [draft, setDraft] = useFilterDraft(filters, open);
 *   <FilterButton count={activeCount} onClick={() => setOpen(true)} />
 *   <FilterDrawer open={open} onOpenChange={setOpen}
 *     onApply={() => setFilters(draft)} onClear={() => setFilters(emptyFilters)}>
 *     <FilterGroup title="Status">…controls bound to draft…</FilterGroup>
 *   </FilterDrawer>
 */

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Commit the draft. The drawer closes afterwards. */
  onApply: () => void;
  /** Reset to no filters (applied immediately). The drawer stays open. */
  onClear: () => void;
  /** Optional chips summarising the draft, shown above the groups. */
  chips?: React.ReactNode;
  children: React.ReactNode;
}

export const FilterDrawer = ({
  open,
  onOpenChange,
  title = "Filters",
  description,
  onApply,
  onClear,
  chips,
  children,
}: FilterDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[22rem]">
      <SheetHeader className="space-y-0.5 border-b border-border px-5 py-3 pr-14 text-left">
        <SheetTitle className="text-base leading-6">{title}</SheetTitle>
        {description ? (
          <SheetDescription className="text-xs">{description}</SheetDescription>
        ) : (
          <SheetDescription className="sr-only">Choose filters, then apply them to the list.</SheetDescription>
        )}
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {chips && <div className="flex flex-wrap gap-1">{chips}</div>}
        {children}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
        <Button variant="ghost" onClick={onClear}>{common.clearAll}</Button>
        <Button
          onClick={() => {
            onApply();
            onOpenChange(false);
          }}
        >
          {common.applyFilters}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

/** A titled group inside the drawer (DS: small uppercase group title). */
export const FilterGroup = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  // role="group" + aria-labelledby gives controls without their own label
  // (most selects/inputs in the drawers) the group title as their name context.
  const headingId = React.useId();
  return (
    <div role="group" aria-labelledby={headingId} className={cn("flex flex-col gap-2", className)}>
      <span id={headingId} className="text-xs font-medium uppercase leading-4 tracking-[.04em] text-muted-foreground">{title}</span>
      {children}
    </div>
  );
};

/** The toolbar trigger that opens the drawer, with an applied-filter count. */
export const FilterButton = ({
  count = 0,
  className,
  children = "Filters",
  ...props
}: ButtonProps & { count?: number }) => (
  <Button variant="outline" className={cn("relative shrink-0", className)} {...props}>
    <SlidersHorizontal className="h-4 w-4" />
    {children}
    {count > 0 && (
      <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
        {count}
      </span>
    )}
  </Button>
);

/**
 * Draft copy of the applied filters, re-synced from `applied` each time the
 * drawer opens so abandoned edits (closing without Apply) are discarded.
 */
export function useFilterDraft<T>(applied: T, open: boolean) {
  const [draft, setDraft] = React.useState<T>(applied);
  React.useEffect(() => {
    if (open) setDraft(applied);
    // Only re-sync on open; `applied` changing while open would clobber edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return [draft, setDraft] as const;
}
