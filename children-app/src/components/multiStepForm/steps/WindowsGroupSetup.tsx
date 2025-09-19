import { Users, Shield, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WindowsGroupSetup() {
  const groupStatus = {
    exists: true,
    name: "GuardNest_Users",
    members: ["current_user", "admin_user"],
    permissions: "Full Control",
  };

  const userStatus = {
    inGroup: true,
    username: "current_user",
    groupMembership: "GuardNest_Users",
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Windows Group Setup
        </h2>
        <p className="text-muted-foreground">
          Configuring Windows security group and user permissions
        </p>
      </div>

      <div className="grid gap-4">
        {/* Group Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">
                  Security Group Status
                </CardTitle>
                <CardDescription>
                  GuardNest security group configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Group Name:</span>
              <span className="text-sm font-medium">{groupStatus.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Members:</span>
              <span className="text-sm font-medium">
                {groupStatus.members.length} users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Permissions:
              </span>
              <span className="text-sm font-medium">
                {groupStatus.permissions}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* User Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle className="text-base">User Configuration</CardTitle>
                <CardDescription>Current user group membership</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Username:</span>
              <span className="text-sm font-medium">{userStatus.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Group Membership:
              </span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                {userStatus.groupMembership}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="default" className="bg-green-500">
                Configured
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Windows group and user configuration completed successfully.
        </p>
      </div>
    </div>
  );
}
