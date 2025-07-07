import { CheckCircle, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  id: string
  title: string
  description?: string
  timestamp?: string
  status: "completed" | "current" | "pending"
}

interface StatusTimelineProps {
  steps: TimelineStep[]
  className?: string
}

export function StatusTimeline({ steps, className }: StatusTimelineProps) {
  // Calculate progress percentage
  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const progressPercentage = Math.round((completedSteps / (totalSteps - 1)) * 100) || 0

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-3.5 top-10 bottom-0 w-0.5 -ml-px",
                  step.status === "completed" ? "bg-primary" : "bg-muted",
                )}
              />
            )}

            <div className="flex gap-3">
              {/* Status icon */}
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border">
                {step.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : step.status === "current" ? (
                  <Clock className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5 pb-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      step.status === "completed"
                        ? "text-primary"
                        : step.status === "current"
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <time className="text-xs text-muted-foreground" dateTime={new Date(step.timestamp).toISOString()}>
                      {new Date(step.timestamp).toLocaleString()}
                    </time>
                  )}
                </div>
                {step.description && <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
