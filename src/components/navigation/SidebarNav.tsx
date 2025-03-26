
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { XIcon, Home } from "lucide-react";
import { NavItem } from "./NavItem";

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
    </motion.aside>
  );
};
