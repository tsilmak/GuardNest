import { Settings, Play, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ServiceInstallation() {
  const services = [
    {
      name: "GuardNest Proxy Service",
      status: "running",
      startup: "Automatic",
      description: "Manages proxy server and traffic filtering",
    },
    {
      name: "GuardNest Monitoring Service",
      status: "running",
      startup: "Automatic",
      description: "Handles system monitoring and logging",
    },
    {
      name: "GuardNest Certificate Service",
      status: "running",
      startup: "Automatic",
      description: "Manages certificate lifecycle and validation",
    },
  ];

  const installationSteps = [
    {
      step: "Service Installation",
      status: "completed",
      description: "Windows services installed successfully",
    },
    {
      step: "Service Configuration",
      status: "completed",
      description: "Service parameters configured",
    },
    {
      step: "Service Startup",
      status: "completed",
      description: "Services started and running",
    },
    {
      step: "Service Verification",
      status: "completed",
      description: "All services verified and operational",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Service Installation
        </h2>
        <p className="text-muted-foreground">
          Installing and configuring GuardNest system services
        </p>
      </div>

      <div className="grid gap-4">
        {/* Installation Progress */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">
                  Installation Progress
                </CardTitle>
                <CardDescription>Service installation steps</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {installationSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <p className="text-sm font-medium">{step.step}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Completed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-base">Service Status</CardTitle>
                <CardDescription>Current service status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
                    Running
                  </Badge>
                  <Badge variant="secondary">{service.startup}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          All services have been installed and are running successfully.
        </p>
      </div>
    </div>
  );
}
