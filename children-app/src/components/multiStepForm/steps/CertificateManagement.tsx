import { CheckCircle, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CertificateManagement() {
  const certificates = [
    {
      name: "GuardNest Root CA",
      status: "installed",
      type: "Root Certificate",
      expiry: "2025-12-31",
      trusted: true,
    },
    {
      name: "GuardNest Client Cert",
      status: "installed",
      type: "Client Certificate",
      expiry: "2024-12-31",
      trusted: true,
    },
    {
      name: "GuardNest Proxy Cert",
      status: "installed",
      type: "Proxy Certificate",
      expiry: "2024-12-31",
      trusted: true,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "installed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "missing":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "installed":
        return (
          <Badge variant="default" className="bg-green-500">
            Installed
          </Badge>
        );
      case "missing":
        return <Badge variant="destructive">Missing</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Certificate Management
        </h2>
        <p className="text-muted-foreground">
          Managing SSL certificates for secure communication
        </p>
      </div>

      <div className="grid gap-4">
        {certificates.map((cert, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(cert.status)}
                  <div>
                    <CardTitle className="text-base">{cert.name}</CardTitle>
                    <CardDescription>{cert.type}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(cert.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Expiry Date:
                </span>
                <span className="text-sm font-medium">{cert.expiry}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Trust Status:
                </span>
                <Badge
                  variant={cert.trusted ? "default" : "destructive"}
                  className={cert.trusted ? "bg-green-500" : ""}
                >
                  {cert.trusted ? "Trusted" : "Not Trusted"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          All certificates have been installed and are trusted by the system.
        </p>
      </div>
    </div>
  );
}
