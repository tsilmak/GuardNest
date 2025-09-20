// Fetch wrapper with auth handling

async function callRefreshEndpoint(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { absolute?: boolean }
) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const url =
    typeof input === "string"
      ? init?.absolute
        ? input
        : `${base}/api/go${input}`
      : input;

  const doFetch = async () =>
    fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.headers || {}),
      },
    });

  let res = await doFetch();
  if (res.status === 401) {
    const refreshed = await callRefreshEndpoint();
    if (!refreshed) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/testing"; // fallback login route present in project
      }
      return res;
    }
    res = await doFetch();
  }
  return res;
}
