import { Shield, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NetworkRulesSetup() {
  const firewallRules = [
    {
      name: "GuardNest Proxy Inbound",
      status: "active",
      direction: "Inbound",
      protocol: "TCP",
      port: "8080",
      action: "Allow",
    },
    {
      name: "GuardNest Proxy Outbound",
      status: "active",
      direction: "Outbound",
      protocol: "TCP",
      port: "Any",
      action: "Allow",
    },
    {
      name: "GuardNest Monitoring",
      status: "active",
      direction: "Inbound",
      protocol: "TCP",
      port: "9090",
      action: "Allow",
    },
  ];

  const networkFilters = [
    {
      name: "HTTPS Traffic Filter",
      status: "active",
      description: "Filter HTTPS traffic for inspection",
    },
    {
      name: "HTTP Traffic Filter",
      status: "active",
      description: "Filter HTTP traffic for inspection",
    },
    {
      name: "DNS Traffic Filter",
      status: "active",
      description: "Filter DNS queries for monitoring",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "inactive":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Network Rules Setup
        </h2>
        <p className="text-muted-foreground">
          Configuring firewall rules and network filtering
        </p>
      </div>

      <div className="grid gap-4">
        {/* Firewall Rules */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">Firewall Rules</CardTitle>
                <CardDescription>
                  Windows Firewall configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {firewallRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(rule.status)}
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.direction} • {rule.protocol} • Port {rule.port}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
                    {rule.action}
                  </Badge>
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Network Filters */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-base">Network Filters</CardTitle>
                <CardDescription>
                  Traffic filtering configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {networkFilters.map((filter, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(filter.status)}
                  <div>
                    <p className="text-sm font-medium">{filter.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {filter.description}
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
          Network rules and filters have been configured successfully.
        </p>
      </div>
    </div>
  );
}
