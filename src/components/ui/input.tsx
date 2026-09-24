import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[2.125rem] w-full rounded-sm border border-input bg-card px-2 py-1 text-sm leading-5 placeholder:text-grey-300 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:border-grey-300 disabled:bg-grey-100 disabled:text-muted-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
