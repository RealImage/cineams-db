import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Qube DS Tag (small): full pill, medium weight; colour carries meaning.
  "inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border border-transparent px-1.5 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",               // DS primary
        secondary: "bg-grey-100 text-foreground",                    // DS default
        destructive: "bg-red-100 text-red-500",                      // DS negative
        outline: "border-input bg-card text-foreground",
        positive: "bg-green-100 text-green-600",
        notice: "bg-yellow-100 text-yellow-900",
        negative: "bg-red-100 text-red-500",
        product: "bg-wire-50 text-primary",                          // DS primary-secondary
        orange: "bg-orange-100 text-orange-500",
        violet: "bg-purple-100 text-purple-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
