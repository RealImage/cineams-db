
import { Construction } from "lucide-react";

const ScreenPulseReports = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
      <Construction className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
      <p className="text-muted-foreground max-w-md">
        Screen Pulse Reports are currently under development. Check back soon for detailed analytics and reporting.
      </p>
    </div>
  );
};

export default ScreenPulseReports;
