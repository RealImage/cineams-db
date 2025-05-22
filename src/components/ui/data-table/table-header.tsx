
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column, SortConfig } from "./types";

interface TableHeaderProps<T> {
  columns: Column<T>[];
  sortConfig: SortConfig<T>;
  onSort: (column: Column<T>) => void;
  showActions: boolean;
}

export function DataTableHeader<T>({
  columns,
  sortConfig,
  onSort,
  showActions
}: TableHeaderProps<T>) {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column, index) => (
          <TableHead 
            key={index} 
            className={`bg-muted/30 ${column.sortable ? 'cursor-pointer hover:bg-muted' : ''}`}
            onClick={() => column.sortable && onSort(column)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {column.sortable && sortConfig.key === column.accessor && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
          </TableHead>
        ))}
        {showActions && <TableHead className="bg-muted/30 w-[60px]"></TableHead>}
      </TableRow>
    </TableHeader>
  );
}
