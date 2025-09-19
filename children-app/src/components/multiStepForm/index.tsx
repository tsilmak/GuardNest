"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Shield, CheckCircle2, Loader2 } from "lucide-react";

const verificationSteps = [
  {
    id: "system-requirements",
    title: "System Requirements Check",
    details: [
      "Checking Windows version compatibility",
      "Verifying administrator privileges",
      "Confirming required services are running",
      "Validating system architecture",
    ],
  },
  {
    id: "windows-group",
    title: "Windows Group Setup",
    details: [
      "Creating GuardNest_Users security group",
      "Creating GuardNest_Admins security group",
      "Configuring user permissions",
      "Applying group policies",
    ],
  },
  {
    id: "certificates",
    title: "Certificate Management",
    details: [
      "Installing root certificates",
      "Configuring certificate trust",
      "Updating SSL/TLS settings",
      "Validating certificate chain",
    ],
  },
  {
    id: "proxy-config",
    title: "Proxy Configuration",
    details: [
      "Setting up proxy server",
      "Configuring routing rules",
      "Setting up network interfaces",
      "Starting proxy service",
    ],
  },
  {
    id: "network-rules",
    title: "Network Rules Setup",
    details: [
      "Creating firewall rules",
      "Applying network policies",
      "Configuring security groups",
      "Enabling traffic filtering",
    ],
  },
  {
    id: "service-install",
    title: "Service Installation",
    details: [
      "Installing GuardNest Proxy service",
      "Installing GuardNest Monitor service",
      "Starting services",
      "Resolving service dependencies",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring Setup",
    details: [
      "Deploying monitoring agents",
      "Configuring log collection",
      "Creating alert rules",
      "Initializing dashboard",
    ],
  },
  {
    id: "verification",
    title: "Final Verification",
    details: [
      "Verifying all components",
      "Testing system integration",
      "Validating security policies",
      "Confirming GuardNest readiness",
    ],
  },
];

export default function VerificationProcess() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Function to handle each verification step
  const handleStepVerification = async (stepId: string) => {
    console.log(`Starting verification for: ${stepId}`);

    // Simulate API call with console.log
    switch (stepId) {
      case "system-requirements":
        console.log("Checking Windows version...");
        console.log("Verifying admin privileges...");
        console.log("Checking required services...");
        console.log("Validating architecture...");
        break;
      case "windows-group":
        console.log("Creating GuardNest_Users group...");
        console.log("Creating GuardNest_Admins group...");
        console.log("Configuring permissions...");
        console.log("Applying policies...");
        break;
      case "certificates":
        console.log("Installing root certificates...");
        console.log("Configuring certificate trust...");
        console.log("Updating SSL/TLS settings...");
        console.log("Validating certificate chain...");
        break;
      case "proxy-config":
        console.log("Setting up proxy server...");
        console.log("Configuring routing rules...");
        console.log("Setting up network interfaces...");
        console.log("Starting proxy service...");
        break;
      case "network-rules":
        console.log("Creating firewall rules...");
        console.log("Applying network policies...");
        console.log("Configuring security groups...");
        console.log("Enabling traffic filtering...");
        break;
      case "service-install":
        console.log("Installing GuardNest Proxy service...");
        console.log("Installing GuardNest Monitor service...");
        console.log("Starting services...");
        console.log("Resolving dependencies...");
        break;
      case "monitoring":
        console.log("Deploying monitoring agents...");
        console.log("Configuring log collection...");
        console.log("Creating alert rules...");
        console.log("Initializing dashboard...");
        break;
      case "verification":
        console.log("Verifying all components...");
        console.log("Testing system integration...");
        console.log("Validating security policies...");
        console.log("Confirming GuardNest readiness...");
        break;
    }

    console.log(`${stepId} verification completed, moving on...`);
  };

  const startVerification = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setCurrentStep(0);

    for (let i = 0; i < verificationSteps.length; i++) {
      setCurrentStep(i);
      await handleStepVerification(verificationSteps[i].id);

      // Add a small delay between steps for better UX
      if (i < verificationSteps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setIsComplete(true);
    setIsRunning(false);
  };

  // Auto-start verification when component mounts (optional)
  useEffect(() => {
    // Uncomment the line below if you want verification to start automatically
    // startVerification()
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md p-8 shadow-xl border-0 bg-card/80 backdrop-blur-sm"
        style={{ borderRadius: "24px" }}
      >
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              {isComplete ? (
                <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
              ) : isRunning ? (
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              ) : (
                <Shield className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-semibold text-foreground text-balance">
              {isComplete
                ? "GuardNest Setup Complete"
                : isRunning
                ? "Setting Up GuardNest"
                : "GuardNest System Verification"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isComplete
                ? "All security components have been configured successfully"
                : isRunning
                ? "Please wait while we configure your security system"
                : "Click start to begin the comprehensive system setup"}
            </p>
          </div>

          {/* Progress Indicator */}
          {isRunning && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-foreground font-medium">
                  {verificationSteps[currentStep]?.title}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      ((currentStep + 1) / verificationSteps.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {isComplete && (
            <div className="space-y-4">
              <div className="w-full bg-accent rounded-full h-2">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-full" />
              </div>
              <Button
                onClick={() => {
                  setIsComplete(false);
                  setCurrentStep(0);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium py-3 shadow-lg"
                style={{ borderRadius: "16px" }}
              >
                Run Verification Again
              </Button>
            </div>
          )}

          {/* Start Button */}
          {!isRunning && !isComplete && (
            <Button
              onClick={startVerification}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium py-3 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              Start System Verification
            </Button>
          )}

          {/* Details Dropdown */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground hover:bg-accent font-medium"
                style={{ borderRadius: "12px" }}
              >
                <span>Show Details</span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    showDetails ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <ScrollArea className="h-64 bg-muted/50 rounded-2xl">
                <div className="p-4 space-y-3">
                  {verificationSteps.map((step, index) => (
                    <div key={step.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index <= currentStep || isComplete
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            index <= currentStep || isComplete
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {(index <= currentStep || isComplete) && (
                        <div className="ml-4 space-y-1">
                          {step.details.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="text-xs text-muted-foreground flex items-center space-x-2"
                            >
                              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}
