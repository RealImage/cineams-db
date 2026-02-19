
import { useState } from "react";
import { FileSpreadsheet, FileText, FileType2, Download, Search, AlertCircle, CalendarIcon } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const timezones = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo",
  "Asia/Shanghai", "Australia/Sydney", "Pacific/Auckland",
];

// Define report categories and their report types
const reportCategories = [
  {
    name: "Approvals",
    icon: <FileText className="h-4 w-4" />,
    reports: [
      "Chain Updates",
      "Company Claims",
      "Integrators",
      "Partners",
      "Theatre Additions",
      "Theatre Deletions",
      "Theatre Updates"
    ],
  },
  {
    name: "Validations",
    icon: <AlertCircle className="h-4 w-4" />,
    reports: [
      "Device Conflicts",
      "Facilities without Chains",
      "Facilities without Location",
      "Facility Duplications",
      "Missing Models",
      "Missing Places",
      "Missing Province Codes"
    ],
  },
  {
    name: "Screens",
    icon: <FileType2 className="h-4 w-4" />,
    reports: [
      "Screens with Numeric Names",
      "Screens without Devices",
      "Screens without Screen Names or Numbers"
    ],
  },
  {
    name: "Third-party",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    reports: [
      "Third-party Chain Updates: API",
      "Third-party Theatre Updates: API",
      "Third-party Theatre Updates: FLM"
    ],
  },
  {
    name: "Devices",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    reports: [
      "All Devices",
      "Devices - Expired / Missing Certificates",
      "Devices - About to Expire Certificates",
      "Device Conflicts - Global",
      "Device Conflicts - India",
      "WireTAPs"
    ],
  }
];

type FormatType = "xlsx" | "csv" | "pdf";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timezone, setTimezone] = useState("UTC");
  
  const handleExport = (reportName: string, format: FormatType) => {
    if (reportName === "Devices - About to Expire Certificates") {
      if (!startDate || !endDate) {
        toast.error("Please select both Start and End dates before exporting.");
        return;
      }
    }
    // In a real app, this would handle the actual export
    toast.success(`Exported ${reportName} report as ${format.toUpperCase()}`);
  };
  
  // Filter reports based on search term
  const filteredCategories = searchTerm 
    ? reportCategories.map(category => ({
        ...category,
        reports: category.reports.filter(report => 
          report.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.reports.length > 0)
    : reportCategories;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for reports..."
          className="pl-8 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <DashboardCard 
            key={category.name} 
            title={category.name} 
            className="overflow-visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.reports.map((report) => (
                <div 
                  key={report}
                  className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-3 items-start">
                      <div className="mt-0.5">{category.icon}</div>
                      <div>
                        <h3 className="font-medium text-sm">{report}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Export data in your preferred format
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExport(report, "xlsx")}>
                        <span className="text-xs font-medium mr-1">XLSX</span>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(report, "csv")}>
                        <span className="text-xs font-medium mr-1">CSV</span>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(report, "pdf")}>
                        <span className="text-xs font-medium mr-1">PDF</span>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {report === "Devices - About to Expire Certificates" && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal w-full", !startDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {startDate ? format(startDate, "dd MMM yyyy") : "Start Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal w-full", !endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {endDate ? format(endDate, "dd MMM yyyy") : "End Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(tz => (
                            <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}

            </div>
          </DashboardCard>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No reports match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
