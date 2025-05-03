
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { XIcon, Home, LogOut, ExternalLink } from "lucide-react";
import { NavItem } from "./NavItem";
import { Separator } from "@/components/ui/separator";

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
} from "lucide-react";

export const SidebarNav = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
  
  const footerLinks = [
    {
      icon: <ExternalLink size={16} />,
      label: "Terms of Service",
      path: "https://www.qubecinema.com/terms-use",
      external: true
    },
    {
      icon: <ExternalLink size={16} />,
      label: "Privacy Policy",
      path: "https://www.qubewire.com/privacypolicy",
      external: true
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
      className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border px-3 py-4 flex flex-col"
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
      
      {/* User information */}
      <div className="mb-6 px-2">
        <h3 className="font-semibold text-sm">{userData.name}</h3>
        <p className="text-xs text-muted-foreground">{userData.company}</p>
        <p className="text-xs text-muted-foreground">{userData.role}</p>
      </div>
      
      <nav className="space-y-1 flex-1 overflow-auto">
        {navItems.map((item, i) => (
          <NavItem
            key={i}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive(item.path)}
            disabled={item.disabled}
          />
        ))}
      </nav>
      
      {/* Footer links */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <div className="space-y-1">
          {footerLinks.map((link, i) => (
            <NavItem
              key={i}
              icon={link.icon}
              label={link.label}
              path={link.path}
              isActive={false}
              external={link.external}
              className="text-xs py-1.5"
            />
          ))}
        </div>
      </div>
    </motion.aside>
  );
};
