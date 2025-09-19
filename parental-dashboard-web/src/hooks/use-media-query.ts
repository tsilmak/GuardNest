"use client";

import * as React from "react";

interface UseMediaQueryOptions {
  ssr?: boolean;
  fallback?: boolean;
}

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { ssr = true, fallback = false } = options;

  const [matches, setMatches] = React.useState(() => {
    if (ssr) {
      return fallback;
    }
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query, ssr]);

  return matches;
}
