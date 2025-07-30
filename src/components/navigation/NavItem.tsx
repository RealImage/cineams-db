
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  disabled?: boolean;
  external?: boolean;
  className?: string;
  collapsed?: boolean;
}

export const NavItem = ({ 
  icon, 
  label, 
  path, 
  isActive, 
  disabled, 
  external = false,
  className,
  collapsed = false
}: NavItemProps) => {
  const baseClasses = cn(
    "flex items-center py-2 rounded-md text-sm transition-colors",
    collapsed ? "px-2 justify-center" : "px-3",
    isActive
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted",
    disabled && "opacity-50 pointer-events-none",
    className
  );
  
  const content = (
    <>
      <span className={collapsed ? "" : "mr-3"}>{icon}</span>
      {!collapsed && label}
    </>
  );

  const linkElement = external ? (
    <a 
      href={path} 
      target="_blank" 
      rel="noopener noreferrer"
      className={baseClasses}
    >
      {content}
    </a>
  ) : (
    <Link
      to={path}
      className={baseClasses}
    >
      {content}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {linkElement}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return linkElement;
};
