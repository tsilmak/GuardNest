"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Sync theme preference to cookie for SSR
export function ThemeCookieSync() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Get resolved theme
    const resolved = theme === "system" ? systemTheme : theme;
    if (!resolved) return;
    try {
      // Set theme cookie
      document.cookie = `theme=${resolved}; Path=/; Max-Age=${
        60 * 60 * 24 * 180
      }; SameSite=Lax`;
    } catch {}
  }, [theme, systemTheme]);

  return null;
}
