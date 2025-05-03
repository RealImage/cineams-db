
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  disabled?: boolean;
  external?: boolean;
  className?: string;
}

export const NavItem = ({ 
  icon, 
  label, 
  path, 
  isActive, 
  disabled, 
  external = false,
  className
}: NavItemProps) => {
  const baseClasses = cn(
    "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
    isActive
      ? "bg-primary/10 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted",
    disabled && "opacity-50 pointer-events-none",
    className
  );
  
  if (external) {
    return (
      <a 
        href={path} 
        target="_blank" 
        rel="noopener noreferrer"
        className={baseClasses}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </a>
    );
  }
  
  return (
    <Link
      to={path}
      className={baseClasses}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};
