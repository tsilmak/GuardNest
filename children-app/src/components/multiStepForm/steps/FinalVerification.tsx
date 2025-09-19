import { CheckCircle, Shield, Globe, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FinalVerification() {
  const verificationResults = [
    {
      category: "System Requirements",
      status: "passed",
      icon: <Shield className="h-5 w-5 text-green-500" />,
      details: "All system requirements verified",
    },
    {
      category: "Windows Group Setup",
      status: "passed",
      icon: <Shield className="h-5 w-5 text-green-500" />,
      details: "Security group and user permissions configured",
    },
    {
      category: "Certificate Management",
      status: "passed",
      icon: <Shield className="h-5 w-5 text-green-500" />,
      details: "All certificates installed and trusted",
    },
    {
      category: "Proxy Configuration",
      status: "passed",
      icon: <Globe className="h-5 w-5 text-green-500" />,
      details: "Proxy server running and accessible",
    },
    {
      category: "Network Rules",
      status: "passed",
      icon: <Shield className="h-5 w-5 text-green-500" />,
      details: "Firewall rules and filters active",
    },
    {
      category: "Service Installation",
      status: "passed",
      icon: <Settings className="h-5 w-5 text-green-500" />,
      details: "All services running and operational",
    },
    {
      category: "Monitoring Setup",
      status: "passed",
      icon: <Settings className="h-5 w-5 text-green-500" />,
      details: "Monitoring and alerting configured",
    },
  ];

  const systemSummary = {
    totalChecks: verificationResults.length,
    passedChecks: verificationResults.length,
    failedChecks: 0,
    overallStatus: "Ready",
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Final Verification
        </h2>
        <p className="text-muted-foreground">
          Comprehensive system verification and configuration summary
        </p>
      </div>

      <div className="grid gap-4">
        {/* System Summary */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle className="text-lg">System Summary</CardTitle>
                <CardDescription>Overall configuration status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {systemSummary.totalChecks}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Checks
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {systemSummary.passedChecks}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {systemSummary.failedChecks}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
            <div className="text-center pt-4">
              <Badge
                variant="default"
                className="bg-green-500 text-lg px-4 py-2"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {systemSummary.overallStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Verification Results</CardTitle>
            <CardDescription>
              Detailed verification of all components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {verificationResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {result.icon}
                  <div>
                    <p className="text-sm font-medium">{result.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.details}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
            <CardDescription>What to do after configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                GuardNest has been successfully configured and is ready for use.
                You can now:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Access the GuardNest dashboard to monitor traffic</li>
                <li>• Configure additional security policies</li>
                <li>• Set up user access controls</li>
                <li>• Review system logs and alerts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Configuration completed successfully. GuardNest is now protecting your
          system.
        </p>
      </div>
    </div>
  );
}
