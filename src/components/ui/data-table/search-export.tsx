
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SearchExportProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchPlaceholder: string;
  children?: React.ReactNode;
}

export function SearchExport({
  searchTerm,
  setSearchTerm,
  searchPlaceholder,
  children
}: SearchExportProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {children}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Export <Download className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>CSV</DropdownMenuItem>
          <DropdownMenuItem>Excel</DropdownMenuItem>
          <DropdownMenuItem>PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
