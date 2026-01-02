import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { XIcon, Home, LogOut, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { NavItem } from "./NavItem";
import { NavItemWithSubmenu } from "./NavItemWithSubmenu";
import { Separator } from "@/components/ui/separator";

import {
  Building2,
  LinkIcon,
  Monitor,
  Building,
  FileText,
  LayoutDashboard,
  List,
  Users,
  Bell,
  Settings,
  Map,
  ClipboardList,
  HardDrive,
} from "lucide-react";

export const SidebarNav = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  onCollapsedChange 
}: { 
  sidebarOpen: boolean, 
  setSidebarOpen: (open: boolean) => void,
  onCollapsedChange?: (collapsed: boolean) => void 
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };
  
  // Mock user data (replace with actual user context when available)
  const userData = {
    name: "John Smith",
    company: "Qube Wire",
    role: "Administrator"
  };
  
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
      path: "/wiretap-devices",
      disabled: false 
    },
  ];

  const fleetManagementSubItems = [
    { label: "Task Management", path: "/fleet-management/tasks", icon: ClipboardList },
    { label: "Image Management", path: "/fleet-management/images", icon: HardDrive },
  ];

  const bottomNavItems = [
    { 
      icon: <Building size={20} />, 
      label: "Companies", 
      path: "#",
      disabled: true 
    },
    { 
      icon: <FileText size={20} />, 
      label: "Reports", 
      path: "/reports",
      disabled: false 
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
  
  // Modified footer links with Terms of Service and Privacy Policy combined
  const footerLinks = [
    {
      label: "Terms of Service | Privacy Policy",
      elements: [
        {
          label: "Terms of Service",
          path: "https://www.qubecinema.com/terms-use"
        },
        {
          label: "Privacy Policy",
          path: "https://www.qubewire.com/privacypolicy"
        }
      ]
    },
    {
      icon: <ExternalLink size={16} />,
      label: "About Qube Wire",
      path: "https://www.qubewire.com/about-us",
      external: true
    },
    {
      icon: <LogOut size={16} />,
      label: "Sign Out",
      path: "/logout",
      external: false
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <motion.aside
      className={`fixed inset-y-0 left-0 z-50 bg-background border-r border-border py-4 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-64 px-3'
      }`}
      initial={isMobile ? { x: "-100%" } : false}
      animate={isMobile && sidebarOpen ? { x: 0 } : false}
    >
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed ? (
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CinemaDB</span>
          </Link>
        ) : (
          <Link to="/" className="flex justify-center w-full">
            <Home className="h-6 w-6 text-primary" />
          </Link>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <XIcon size={20} />
          </Button>
        )}
      </div>

      {/* Collapse/Expand button */}
      {!isMobile && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="w-full flex justify-center"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      )}
      
      {/* User information */}
      {!isCollapsed && (
        <div className="mb-6 px-2">
          <h3 className="font-semibold text-sm">{userData.name}</h3>
          <p className="text-xs text-muted-foreground">{userData.company}</p>
          <p className="text-xs text-muted-foreground">{userData.role}</p>
        </div>
      )}
      
      <nav className="space-y-1 flex-1 overflow-auto">
        {navItems.map((item, i) => (
          <NavItem
            key={i}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive(item.path)}
            disabled={item.disabled}
            collapsed={isCollapsed}
          />
        ))}
        
        {/* Fleet Management with submenu */}
        <NavItemWithSubmenu
          icon={Settings}
          label="Fleet Management"
          basePath="/fleet-management"
          subItems={fleetManagementSubItems}
          isCollapsed={isCollapsed}
        />
        
        {bottomNavItems.map((item, i) => (
          <NavItem
            key={`bottom-${i}`}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive(item.path)}
            disabled={item.disabled}
            collapsed={isCollapsed}
          />
        ))}
      </nav>
      
      {/* Footer links with combined Terms/Privacy */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <div className="space-y-2">
          {!isCollapsed ? (
            <>
              {/* Terms and Privacy combined with separator */}
              <div className="flex items-center px-2 text-xs text-muted-foreground">
                <ExternalLink size={16} className="mr-2" />
                <a href="https://www.qubecinema.com/terms-use" target="_blank" rel="noopener noreferrer" 
                   className="hover:text-foreground transition-colors">Terms of Service</a>
                <span className="mx-1">|</span>
                <a href="https://www.qubewire.com/privacypolicy" target="_blank" rel="noopener noreferrer"
                   className="hover:text-foreground transition-colors">Privacy Policy</a>
              </div>
              
              {/* About Qube Wire and Sign Out */}
              {footerLinks.slice(1).map((link, i) => (
                <NavItem
                  key={i}
                  icon={link.icon}
                  label={link.label}
                  path={link.path}
                  isActive={false}
                  external={link.external}
                  className="text-xs py-1.5"
                  collapsed={false}
                />
              ))}
            </>
          ) : (
            /* Collapsed footer - only icons with tooltips */
            <>
              {footerLinks.slice(1).map((link, i) => (
                <NavItem
                  key={i}
                  icon={link.icon}
                  label={link.label}
                  path={link.path}
                  isActive={false}
                  external={link.external}
                  className="text-xs py-1.5"
                  collapsed={true}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
