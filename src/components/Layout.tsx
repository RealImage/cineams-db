
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  LinkIcon,
  Film,
  Monitor,
  Building,
  FileText,
  LayoutDashboard,
  List,
  Users,
  Bell,
  Settings,
  Map,
  MenuIcon,
  XIcon,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  Home
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const navItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard", 
      path: "/" 
    },
    { 
      icon: <Building2 size={20} />, 
      label: "Theatres", 
      path: "/theatres" 
    },
    { 
      icon: <LinkIcon size={20} />, 
      label: "Chains", 
      path: "/chains" 
    },
    { 
      icon: <Monitor size={20} />, 
      label: "TDL Devices", 
      path: "/tdl-devices" 
    },
    { 
      icon: <List size={20} />, 
      label: "WireTAP Devices", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <Building size={20} />, 
      label: "Companies", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <FileText size={20} />, 
      label: "Reports", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <Map size={20} />, 
      label: "Location Management", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <Users size={20} />, 
      label: "User Management", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <Bell size={20} />, 
      label: "Notification Settings", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <Settings size={20} />, 
      label: "Role Management", 
      path: "#",
      disabled: true 
    },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border px-3 py-4 flex flex-col",
          isMobile && "transition-transform duration-300",
          isMobile && (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        )}
        initial={isMobile ? { x: "-100%" } : false}
        animate={isMobile && sidebarOpen ? { x: 0 } : false}
      >
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CinemasDB</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <XIcon size={20} />
            </Button>
          )}
        </div>
        
        <nav className="space-y-1 flex-1 overflow-auto">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted",
                item.disabled && "opacity-50 pointer-events-none"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto">
          <div className="border-t border-border pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                      <User size={16} className="text-primary" />
                    </div>
                    <div className="text-left mr-2">
                      <p className="text-sm font-medium">John Smith</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                    <ChevronDown size={16} className="ml-auto" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        !isMobile && "ml-64"
      )}>
        {/* Header */}
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
              {navItems.find(item => isActive(item.path))?.label || "Dashboard"}
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
        
        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
