
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
    "flex min-h-10 items-center rounded-md py-2 text-sm font-medium transition-colors duration-150",
    collapsed ? "px-2 justify-center" : "px-3",
    isActive
      ? "bg-grey-10 text-grey-800 font-semibold shadow-[inset_0_0_0_1px_theme(colors.grey.100)]"
      : "text-grey-700 hover:bg-black/5 [&_svg]:text-grey-500 hover:[&_svg]:text-grey-800",
    disabled && "pointer-events-none text-grey-300 [&_svg]:text-grey-300",
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
