"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StepProgress, type WizardStep } from "@/components/step-progress"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

// Re-export WizardStep for convenience
export type { WizardStep }

interface WizardProps {
  steps: WizardStep[]
  isOpen: boolean
  onClose: () => void
  onComplete: (data: Record<string, unknown>) => Promise<void>
  title: string
  description?: string
  children: (props: {
    currentStep: number
    formData: Record<string, unknown>
    updateFormData: (data: Record<string, unknown>) => void
    goToNextStep: () => void
    goToPrevStep: () => void
  }) => React.ReactNode
}

export function Wizard({
  steps,
  isOpen,
  onClose,
  onComplete,
  title,
  description,
  children
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const updateFormData = useCallback((newData: Record<string, unknown>) => {
    setFormData((prev: Record<string, unknown>) => ({ ...prev, ...newData }))
  }, [])

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, isLastStep])

  const goToPrevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [isFirstStep])

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onComplete(formData)
      // Reset wizard state
      setCurrentStep(0)
      setFormData({})
      setCompletedSteps([])
      onClose()
    } catch (error) {
      console.error('Error completing wizard:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(0)
      setFormData({})
      setCompletedSteps([])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children({
            currentStep,
            formData,
            updateFormData,
            goToNextStep,
            goToPrevStep
          })}
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="border-t px-6 py-4 flex-row justify-between sm:justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevStep}
            disabled={isFirstStep || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Producto'
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
