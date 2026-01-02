import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubMenuItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

interface NavItemWithSubmenuProps {
  icon: LucideIcon;
  label: string;
  basePath: string;
  subItems: SubMenuItem[];
  isCollapsed: boolean;
}

export const NavItemWithSubmenu = ({
  icon: Icon,
  label,
  basePath,
  subItems,
  isCollapsed,
}: NavItemWithSubmenuProps) => {
  const location = useLocation();
  const isAnyChildActive = subItems.some(item => location.pathname.startsWith(item.path));
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  const handleToggle = () => {
    if (!isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  if (isCollapsed) {
    return (
      <div className="relative group">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer",
            isAnyChildActive && "bg-accent text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {/* Flyout menu for collapsed state */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-popover border rounded-lg shadow-lg py-2 min-w-[180px]">
            <div className="px-3 py-2 text-sm font-medium text-foreground border-b mb-1">
              {label}
            </div>
            {subItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                  location.pathname.startsWith(item.path) && "bg-accent text-foreground"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          isAnyChildActive && "bg-accent/50 text-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
              {subItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    location.pathname.startsWith(item.path) && "bg-accent text-foreground"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
