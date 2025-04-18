
import { useState } from "react";
import { FileSpreadsheet, FileText, FileType2, Download, Search, AlertCircle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      "WireTAPs"
    ],
  }
];

type FormatType = "xlsx" | "csv" | "pdf";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleExport = (reportName: string, format: FormatType) => {
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
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for reports..."
          className="pl-8 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredCategories.map((category) => (
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(report, "xlsx")}
                    >
                      <span className="text-xs font-medium mr-1">XLSX</span>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(report, "csv")}
                    >
                      <span className="text-xs font-medium mr-1">CSV</span>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(report, "pdf")}
                    >
                      <span className="text-xs font-medium mr-1">PDF</span>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
