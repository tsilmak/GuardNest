import { ResponsiveNavigation } from "@/components/app-sidebar";
import type React from "react";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveNavigation>{children}</ResponsiveNavigation>;
}
