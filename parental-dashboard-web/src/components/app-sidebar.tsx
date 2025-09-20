"use client";

import { useMemo } from "react";
import {
  ChevronDown,
  Circle,
  Diamond,
  Heart,
  Home,
  Menu,
  Music,
  Plus,
  Radio,
  Settings,
  Shield,
  Triangle,
} from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { NavigationProvider, useNavigation } from "@/hooks/use-navigation";
import { useRouter } from "next/navigation";
import { mockChildren } from "@/lib/mock-data";

// Navigation data types
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  isActive?: boolean;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  children?: Array<NavigationItem>;
}

// Desktop nav items
const navigationItems: Array<NavigationItem> = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
    isActive: true,
  },
  {
    id: "blocked-websites",
    label: "Blocked Websites",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "new",
    label: "New",
    icon: <Plus className="h-5 w-5" />,
  },
  {
    id: "radio",
    label: "Radio",
    icon: <Radio className="h-5 w-5" />,
  },
  {
    id: "children",
    label: "Children",
    icon: null,
    isCollapsible: true,
    isExpanded: true,
    children: mockChildren.slice(0, 3).map((child) => ({
      id: `child-${child.id}`,
      label: child.name,
      icon: <UserIcon />,
    })),
  },
];

function UserIcon() {
  return <UserCircle />;
}

function UserCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" />
      <path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  );
}

// Mobile nav items
const mobileItems: Array<NavigationItem> = [
  {
    id: "tab1",
    label: "Tab 1",
    icon: <Diamond className="h-5 w-5" />,
    isActive: true,
  },
  {
    id: "tab2",
    label: "Tab 2",
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: "tab3",
    label: "Tab 3",
    icon: <Triangle className="h-5 w-5" />,
  },
  {
    id: "tab4",
    label: "Tab 4",
    icon: <Settings className="h-5 w-5" />,
  },
];

// Desktop sidebar component
export function DesktopSidebar() {
  const {
    activeItem,
    setActiveItem,
    expandedSections,
    toggleSection,
    isCollapsed,
    setIsCollapsed,
  } = useNavigation();
  const router = useRouter();

  // Only show items with icons when collapsed
  const visibleItems = useMemo(() => {
    if (isCollapsed) {
      return navigationItems.filter((item) => item.icon !== null);
    }
    return navigationItems;
  }, [isCollapsed]);

  // Render navigation item
  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedSections.includes(item.id);

    return (
      <div key={item.id}>
        <button
          // Handle clicks
          onClick={() => {
            if (item.isCollapsible && !isCollapsed) {
              toggleSection(item.id);
            } else if (!item.isCollapsible) {
              setActiveItem(item.id);
              // Navigate based on item ID
              if (item.id === "home") {
                router.push("/");
              } else if (item.id === "blocked-websites") {
                router.push("/blocked-websites");
              } else if (item.id.startsWith("child-")) {
                const childId = item.id.replace("child-", "");
                router.push(`/panel/children/${childId}`);
              }
            }
          }}
          className={cn(
            "rounded-full shadow-inner w-full flex items-center transition-all duration-300 group relative text-left overflow-hidden border-2 border-transparent",
            isCollapsed ? "p-2 justify-center" : "gap-3 p-1.5",
            isCollapsed &&
              isActive &&
              "bg-accent text-red-500 shadow-sm border-2 border-border/40",
            isCollapsed &&
              !isActive &&
              "hover:bg-accent text-muted-foreground hover:text-foreground border-2 border-transparent",
            !isCollapsed &&
              isActive &&
              "bg-accent text-red-500 shadow-sm border-2 border-border/40",
            !isCollapsed &&
              !isActive &&
              !item.isCollapsible &&
              "hover:bg-accent text-primary hover:text-red-500 border-2 border-transparent",
            item.isCollapsible &&
              "text-primary hover:text-foreground border-2 border-transparent",
            isChild && "py-1.5",
            !isChild &&
              !item.icon &&
              "text-sm font-medium text-muted-foreground mt-4 mb-1.5 cursor-default hover:bg-transparent border-2 border-transparent",
            isCollapsed && !item.icon && "hidden"
          )}
          aria-label={item.label}
        >
          {item.icon && (
            <div
              className={cn(
                "shrink-0 mx-1.5 relative flex items-center justify-center",
                isCollapsed ? "w-6 h-6" : ""
              )}
            >
              {item.icon}
              {item.badge && <p>{item.badge}</p>}
            </div>
          )}
          <div
            className={cn(
              "flex items-center justify-between flex-1 transition-all ease-in-out",
              isCollapsed
                ? "opacity-0 w-0 overflow-hidden duration-0"
                : "opacity-100 duration-300 delay-50"
            )}
          >
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                isActive && "font-medium",
                !item.icon && "font-medium"
              )}
            >
              {item.label}
            </span>
            {item.isCollapsible && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>
        </button>

        {item.children && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "rounded-2xl hidden md:flex fixed inset-y-0 left-2 top-2 bottom-2 z-50 bg-sidebar transition-all duration-300 ease-in-out h-[98%] shadow-[inset_6px_6px_14px_rgb(from_var(--foreground)_r_g_b_/_0.06),inset_-6px_-6px_14px_rgb(from_var(--foreground)_r_g_b_/_0.04),inset_1px_1px_4px_rgb(from_var(--foreground)_r_g_b_/_0.01),inset_-1px_-1px_4px_rgb(from_var(--foreground)_r_g_b_/_0.002),inset_2px_2px_6px_rgb(from_var(--foreground)_r_g_b_/_0.03),inset_-2px_-2px_6px_rgb(from_var(--foreground)_r_g_b_/_0.02)]",
        isCollapsed ? "w-16" : "w-52"
      )}
    >
      {/* Border gradients for contrast */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {/* Top-left corner gradient */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br blur-lg from-primary  via-transparent to-transparent rounded-tl-2xl"></div>

        {/* Bottom-right corner gradient */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl blur-lg from-primary/20 via-transparent to-transparent rounded-br-2xl"></div>
      </div>

      <div className="flex flex-col h-full w-full min-w-0 relative z-10">
        <div
          className={cn(
            "flex items-center shrink-0 p-2  transition-all duration-300 ease-linear justify-end",
            isCollapsed ? "mr-2 " : ""
          )}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-accent rounded-lg transition-all duration-300 ease-in-out shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu
              className={cn(
                "h-4 w-4 transition-all duration-300 ease-in-out",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "px-2 py-4" : "px-3 py-4"
          )}
        >
          <div className="space-y-1 min-w-0">
            {visibleItems.map((item) => renderNavigationItem(item))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile tab bar component
export function MobileTabBar() {
  const { activeItem, setActiveItem } = useNavigation();

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/90 backdrop-blur-sm rounded-full px-4 py-3">
        <div className="flex items-center gap-6">
          {mobileItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200 relative",
                activeItem === item.id ? "text-blue-500" : "text-white"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  activeItem === item.id && "bg-blue-500/20"
                )}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main layout with sidebar offset
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useNavigation();

  return (
    <main
      className={`p-4 flex-1 transition-all duration-300 ease-in-out ${
        isCollapsed ? "ml-16" : "ml-52"
      }`}
    >
      {children}
    </main>
  );
}

// Main navigation wrapper component
export function ResponsiveNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <div className="flex h-screen overflow-hidden">
        <DesktopSidebar />
        <MobileTabBar />
        <DashboardLayout>{children}</DashboardLayout>
      </div>
    </NavigationProvider>
  );
}
