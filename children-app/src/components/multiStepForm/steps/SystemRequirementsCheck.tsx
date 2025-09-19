import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface RequirementCheck {
  id: string;
  name: string;
  status: "pending" | "checking" | "passed" | "failed";
  details: string;
}

const initialRequirements: RequirementCheck[] = [
  {
    id: "windows-version",
    name: "Windows Version",
    status: "pending",
    details: "Checking Windows 10 or later...",
  },
  {
    id: "admin-rights",
    name: "Administrator Rights",
    status: "pending",
    details: "Verifying administrator privileges...",
  },
  {
    id: "required-services",
    name: "Required Services",
    status: "pending",
    details: "Checking Windows services...",
  },
  {
    id: "system-architecture",
    name: "System Architecture",
    status: "pending",
    details: "Verifying 64-bit architecture...",
  },
];

const passedResults = {
  "windows-version": "Windows 10 or later detected (Windows 11 Pro - 22H2)",
  "admin-rights":
    "User has administrator privileges (Elevated permissions confirmed)",
  "required-services":
    "All required Windows services are running (Windows Defender, Windows Firewall active)",
  "system-architecture":
    "64-bit architecture supported (x64 architecture detected)",
};

export function SystemRequirementsCheck() {
  const [requirements, setRequirements] =
    useState<RequirementCheck[]>(initialRequirements);
  const [isRunning, setIsRunning] = useState(false);

  const runSystemCheck = async () => {
    setIsRunning(true);

    // Reset all requirements to pending
    setRequirements(
      initialRequirements.map((req) => ({ ...req, status: "pending" }))
    );

    // Set all requirements to checking simultaneously
    setRequirements((prev) =>
      prev.map((req) => ({ ...req, status: "checking" }))
    );

    // Run all checks in parallel with random delays to simulate real-world scenario
    const checkPromises = initialRequirements.map(
      async (requirement, _index) => {
        // Random delay between 800ms and 2000ms to simulate different check times
        const delay = Math.random() * 1200 + 800;
        await new Promise((resolve) => setTimeout(resolve, delay));

        return {
          id: requirement.id,
          status: "passed" as const,
          details: passedResults[requirement.id as keyof typeof passedResults],
        };
      }
    );

    // Wait for all checks to complete
    const results = await Promise.all(checkPromises);

    // Update all requirements with results
    setRequirements((prev) =>
      prev.map((req) => {
        const result = results.find((r) => r.id === req.id);
        return result
          ? { ...req, status: result.status, details: result.details }
          : req;
      })
    );

    setIsRunning(false);
  };

  const allPassed = requirements.every((req) => req.status === "passed");
  const hasStarted = requirements.some((req) => req.status !== "pending");

  return (
    <div className="w-full max-w-[81.818182%] mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-foreground text-balance">
          System Requirements Check
        </h1>
        <p className="text-muted-foreground text-pretty">
          Verify your system meets all requirements before proceeding
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium text-card-foreground">
            System Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requirements.map((requirement, _index) => (
            <div
              key={requirement.id}
              className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {requirement.status === "checking" ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : requirement.status === "passed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-card-foreground">
                    {requirement.name}
                  </h3>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      requirement.status === "passed"
                        ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                        : requirement.status === "checking"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {requirement.status === "passed"
                      ? "Passed"
                      : requirement.status === "checking"
                      ? "Checking..."
                      : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-pretty">
                  {requirement.details}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasStarted ? (
                  allPassed ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ All requirements passed
                    </span>
                  ) : (
                    <span>
                      {requirements.filter((r) => r.status === "passed").length}{" "}
                      of {requirements.length} checks completed
                    </span>
                  )
                ) : (
                  "Ready to run system check"
                )}
              </div>
              <Button
                onClick={runSystemCheck}
                disabled={isRunning}
                className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Check...
                  </>
                ) : hasStarted ? (
                  "Run Check Again"
                ) : (
                  "Start System Check"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
