
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HelpCircle, MenuIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Dashboard";
    if (path === "/theatres") return "Theatres";
    if (path === "/chains") return "Chains";
    if (path === "/tdl-devices") return "TDL Devices";
    if (path === "/wiretap-devices") return "WireTAP Devices";
    if (path === "/reports") return "Reports";
    
    return "Dashboard";
  };
  
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={20} />
          </Button>
        )}
        <div className={cn(
          "text-lg font-semibold",
          isMobile ? "ml-4" : "ml-0"
        )}>
          {getPageTitle()}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8"
          >
            <HelpCircle className="mr-1 h-4 w-4" />
            Help
          </Button>
        </div>
      </div>
    </header>
  );
};
