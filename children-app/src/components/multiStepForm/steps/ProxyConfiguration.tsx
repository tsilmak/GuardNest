import { Globe, Settings, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProxyConfiguration() {
  const proxySettings = {
    enabled: true,
    address: "127.0.0.1",
    port: "8080",
    authentication: true,
    status: "active",
  };

  const proxyTests = [
    {
      name: "Proxy Connectivity",
      status: "success",
      description: "Proxy server is reachable",
    },
    {
      name: "Authentication",
      status: "success",
      description: "Proxy authentication working",
    },
    {
      name: "HTTPS Support",
      status: "success",
      description: "HTTPS traffic properly handled",
    },
    {
      name: "System Integration",
      status: "success",
      description: "System proxy settings configured",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <CheckCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Proxy Configuration
        </h2>
        <p className="text-muted-foreground">
          Setting up network proxy for traffic monitoring and filtering
        </p>
      </div>

      <div className="grid gap-4">
        {/* Proxy Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">Proxy Settings</CardTitle>
                <CardDescription>Current proxy configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-sm font-medium">
                {proxySettings.address}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Port:</span>
              <span className="text-sm font-medium">{proxySettings.port}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Authentication:
              </span>
              <Badge
                variant={proxySettings.authentication ? "default" : "secondary"}
                className={proxySettings.authentication ? "bg-green-500" : ""}
              >
                {proxySettings.authentication ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Proxy Tests */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-base">Configuration Tests</CardTitle>
                <CardDescription>
                  Proxy functionality verification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {proxyTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="text-sm font-medium">{test.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {test.description}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Passed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Proxy configuration completed and all tests passed successfully.
        </p>
      </div>
    </div>
  );
}
