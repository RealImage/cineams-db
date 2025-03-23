
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Building2, 
  ChevronRight, 
  Film, 
  HardDrive, 
  LayoutDashboard, 
  List, 
  LogOut, 
  Mail, 
  Monitor, 
  Radio, 
  Settings, 
  User, 
  Users, 
  Home, 
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="h-14 border-b px-4 flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <nav className="hidden md:flex items-center ml-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-foreground">Home</Link>
                  {location.pathname !== "/" && (
                    <>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span className="font-medium text-foreground capitalize">
                        {location.pathname.split("/")[1]}
                      </span>
                    </>
                  )}
                </div>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@cinemasdb.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="page-transition"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation items
  const navItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Theatres", path: "/theatres", icon: Building2 },
    { title: "Chains", path: "/chains", icon: Link },
    { title: "TDL Devices Master", path: "/tdl-devices", icon: HardDrive },
    { title: "WireTAP Devices", path: "/wiretap-devices", icon: Radio },
    { title: "Companies", path: "/companies", icon: Building2 },
    { title: "Reports", path: "/reports", icon: BarChart3 },
    { title: "Master Lists", path: "/master-lists", icon: List },
    { title: "User Management", path: "/user-management", icon: Users },
    { title: "Notification Settings", path: "/notification-settings", icon: Mail },
    { title: "Role Management", path: "/role-management", icon: Settings },
  ];
  
  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex items-center px-4">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Film className="h-5 w-5" />
          <span>CinemasDB</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
