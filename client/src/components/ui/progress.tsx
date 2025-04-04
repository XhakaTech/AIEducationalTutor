import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends 
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: "primary" | "secondary" | "accent" | "green"
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color = "primary", ...props }, ref) => {
  // Define color variants for the progress bar
  const colorVariants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    green: "bg-green-500"
  }

  const gradientVariants = {
    primary: "bg-gradient-to-r from-primary to-accent",
    secondary: "bg-gradient-to-r from-secondary to-primary",
    accent: "bg-gradient-to-r from-accent to-secondary",
    green: "bg-gradient-to-r from-green-500 to-green-400"
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-300 ease-in-out",
          gradientVariants[color]
        )}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundSize: "200% 200%",
          animation: value === 100 ? "gradientFlow 2s ease infinite" : "none"
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
