"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Keeps a `theme` cookie in sync with next-themes selection so SSR can read it.
export function ThemeCookieSync() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Resolve actual theme considering system.
    const resolved = theme === "system" ? systemTheme : theme;
    if (!resolved) return;
    try {
      // Write cookie for server to read on next request. 180 days, Lax.
      document.cookie = `theme=${resolved}; Path=/; Max-Age=${
        60 * 60 * 24 * 180
      }; SameSite=Lax`;
    } catch {}
  }, [theme, systemTheme]);

  return null;
}
