
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column, Action } from "./types";

interface TableBodyProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  getRowActions: (row: T) => Action<T>[];
  showActions: boolean;
}

export function DataTableBody<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  getRowActions,
  showActions
}: TableBodyProps<T>) {
  return (
    <TableBody>
      {data.length > 0 ? (
        data.map((row) => (
          <TableRow 
            key={row.id}
            className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column, colIndex) => {
              const accessorValue = typeof column.accessor === "function"
                ? column.accessor(row)
                : row[column.accessor as keyof T];
                
              return (
                <TableCell key={`${row.id}-${colIndex}`}>
                  {column.cell 
                    ? column.cell(row)
                    : String(accessorValue || "")}
                </TableCell>
              );
            })}
            {showActions && (
              <TableCell className="p-2 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getRowActions(row).map((action, i) => (
                      <DropdownMenuItem 
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                      >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="h-24 text-center">
            No results found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
