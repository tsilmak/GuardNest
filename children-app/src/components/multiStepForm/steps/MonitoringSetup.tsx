import { Activity, FileText, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MonitoringSetup() {
  const monitoringConfig = {
    logging: {
      enabled: true,
      level: "INFO",
      path: "C:\\ProgramData\\GuardNest\\logs",
      retention: "30 days",
    },
    alerts: {
      enabled: true,
      email: "admin@company.com",
      webhook: "https://webhook.company.com/guardnest",
    },
  };

  const monitoringRules = [
    {
      name: "Suspicious Activity Detection",
      status: "active",
      description: "Monitor for unusual network patterns",
    },
    {
      name: "Certificate Expiry Monitoring",
      status: "active",
      description: "Track certificate expiration dates",
    },
    {
      name: "Service Health Monitoring",
      status: "active",
      description: "Monitor service availability and performance",
    },
    {
      name: "Traffic Analysis",
      status: "active",
      description: "Analyze network traffic patterns",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Monitoring Setup
        </h2>
        <p className="text-muted-foreground">
          Configuring monitoring, logging, and alerting systems
        </p>
      </div>

      <div className="grid gap-4">
        {/* Logging Configuration */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">
                  Logging Configuration
                </CardTitle>
                <CardDescription>System logging settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Log Level:</span>
              <span className="text-sm font-medium">
                {monitoringConfig.logging.level}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Log Path:</span>
              <span className="text-sm font-medium">
                {monitoringConfig.logging.path}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retention:</span>
              <span className="text-sm font-medium">
                {monitoringConfig.logging.retention}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Alerting Configuration */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-base">
                  Alerting Configuration
                </CardTitle>
                <CardDescription>
                  Notification and alert settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Email Alerts:
              </span>
              <span className="text-sm font-medium">
                {monitoringConfig.alerts.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Webhook:</span>
              <span className="text-sm font-medium">Configured</span>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Rules */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">Monitoring Rules</CardTitle>
                <CardDescription>Active monitoring rules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitoringRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(rule.status)}
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Monitoring and alerting systems have been configured successfully.
        </p>
      </div>
    </div>
  );
}
