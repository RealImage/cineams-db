
import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./navigation/SidebarNav";
import { Header } from "./navigation/Header";
import { UserMenu } from "./navigation/UserMenu";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  return (
    <div className="min-h-screen bg-background flex">
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
      
      <SidebarNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        !isMobile && "ml-64"
      )}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="p-6">
          <Outlet />
        </main>
        
        <div className="fixed bottom-0 left-0 w-64 border-t border-border py-4 px-3 bg-background hidden md:block">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
