"use client"

import { Progress } from "@/components/ui/progress"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WizardStep {
  id: string
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

interface StepProgressProps {
  steps: WizardStep[]
  currentStep: number
  completedSteps?: number[]
}

export function StepProgress({ steps, currentStep, completedSteps = [] }: StepProgressProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Indicator */}
      <div className="hidden sm:block">
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index) || index < currentStep
            const isCurrent = index === currentStep
            const Icon = step.icon

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center flex-1 relative",
                  index < steps.length - 1 && "after:content-[''] after:absolute after:top-5 after:left-[60%] after:right-[-40%] after:h-0.5 after:bg-muted",
                  isCompleted && index < steps.length - 1 && "after:bg-primary"
                )}
              >
                {/* Circle with Icon/Number */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-200",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-background border-primary text-primary"
                      : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center max-w-[100px]">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: Current Step Info */}
      <div className="sm:hidden text-center space-y-1">
        <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </div>
    </div>
  )
}
