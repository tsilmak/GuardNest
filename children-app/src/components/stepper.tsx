import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Step indicator */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  step.status === "completed" &&
                    "border-primary bg-primary text-primary-foreground",
                  step.status === "current" &&
                    "border-primary bg-primary text-primary-foreground",
                  step.status === "upcoming" &&
                    "border-muted-foreground bg-transparent text-muted-foreground"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step title */}
              <div
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  step.status === "completed" && "text-foreground",
                  step.status === "current" && "text-foreground",
                  step.status === "upcoming" && "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    "h-0.5 w-full transition-colors",
                    step.status === "completed" && "bg-primary",
                    step.status === "current" && "bg-primary",
                    step.status === "upcoming" && "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
