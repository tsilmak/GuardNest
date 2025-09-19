"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";

interface NavigationContextType {
  activeItem: string;
  setActiveItem: (id: string) => void;
  expandedSections: Array<string>;
  toggleSection: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeItem, setActiveItem] = useState("home");
  const [expandedSections, setExpandedSections] = useState(["playlists"]);

  // Deterministic SSR: default to false on server; hydrate from storage without
  // changing the first client render to avoid hydration mismatches.
  const [isCollapsed, setIsCollapsed] = useState(false);

  // On mount, sync from localStorage and then update state (post-hydration).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Persist collapsed state
  const handleSetIsCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeItem,
        setActiveItem,
        expandedSections,
        toggleSection,
        isCollapsed,
        setIsCollapsed: handleSetIsCollapsed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
