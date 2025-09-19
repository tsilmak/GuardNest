"use client";

import { LogOut, Settings, Shield, User } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChartRadialText } from "@/components/radial-usage-time-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WebsiteActivityTracker from "@/components/website-activity-tracker";
import { BlockedWebsitesCard } from "@/components/blocked-websites";

function App() {
  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleProfile = () => {
    console.log("Profile clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex h-14.5 shrink-0 items-center gap-2 px-4">
        <ModeToggle />

        <div className="flex items-center gap-2 justify-between w-full">
          <h1 className="text-xl sm:text-2xl font-semibold">Home</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Privacy & Security</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <img
              src="docs/UI/aaaa.png"
              alt="Computer"
              className="rounded-xl w-full h-auto"
            />
          </div>
          <div className="lg:col-span-1">
            <ChartRadialText />
          </div>
          <div className="lg:col-span-1">
            <BlockedWebsitesCard />
          </div>
        </div>
        <div>
          <WebsiteActivityTracker />
        </div>
      </div>
    </div>
  );
}
export default App;
