
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  previousValue,
  icon,
  description,
  className,
}: StatCardProps) => {
  const [count, setCount] = useState(0);
  
  // Animate the number counting up
  useEffect(() => {
    const duration = 1500; // ms
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.floor(progress * value);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(value);
      } else {
        setCount(currentCount);
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, [value]);
  
  // Calculate percent change
  const percentChange = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  
  return (
    <motion.div
      className={cn(
        "stat-card relative overflow-hidden group",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="absolute right-3 top-3 text-primary opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">
          {count.toLocaleString()}
        </h3>
        
        {previousValue && (
          <div className="flex items-center mt-1">
            <div 
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-full",
                percentChange > 0 
                  ? "bg-green-100 text-green-800" 
                  : percentChange < 0 
                    ? "bg-red-100 text-red-800" 
                    : "bg-gray-100 text-gray-800"
              )}
            >
              {percentChange > 0 ? "+" : ""}
              {percentChange.toFixed(1)}%
            </div>
            {description && (
              <span className="text-xs text-muted-foreground ml-2">
                {description}
              </span>
            )}
          </div>
        )}
        
        {!previousValue && description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};
