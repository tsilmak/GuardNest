import { cookies as dynamicCookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

function isValidCookieDomain(domain: string) {
  if (!domain) return false;
  const lower = domain.toLowerCase();
  const isLocalhost = lower === "localhost" || lower.endsWith(".localhost");
  const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(lower);
  const hasDot = lower.includes(".");
  return !isLocalhost && !isIP && hasDot;
}

type CookieSetOptions = NonNullable<
  Parameters<InstanceType<typeof NextResponse>["cookies"]["set"]>[2]
>;

function getCookieOptions(): CookieSetOptions {
  const isProd = process.env.NODE_ENV === "production";
  const base: CookieSetOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  };
  if (
    process.env.COOKIE_DOMAIN &&
    isValidCookieDomain(process.env.COOKIE_DOMAIN)
  ) {
    base.domain = process.env.COOKIE_DOMAIN;
  }
  return base;
}

export async function POST(req: NextRequest) {
  const cookieOptions = getCookieOptions();
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session_id";
  const refreshCookieName = process.env.REFRESH_COOKIE_NAME ?? "refresh_token";
  const store = await dynamicCookies();
  const sessionId =
    store.get(sessionCookieName)?.value ||
    req.cookies.get(sessionCookieName)?.value;
  const refreshToken =
    store.get(refreshCookieName)?.value ||
    req.cookies.get(refreshCookieName)?.value;

  const client = await dbPool.connect();
  try {
    if (sessionId || refreshToken) {
      await client.query(
        `DELETE FROM "session" WHERE token = $1 OR "refreshToken" = $2`,
        [sessionId ?? "", refreshToken ?? ""]
      );
    }
  } catch (e) {
    console.error("/api/auth/logout error", e);
  } finally {
    client.release();
  }

  const res = NextResponse.json({ ok: true });
  const epoch = new Date(0);
  // Clear session cookie (root path)
  res.cookies.set(sessionCookieName, "", {
    ...cookieOptions,
    maxAge: 0,
    expires: epoch,
  });
  // Clear refresh cookie (auth path)
  res.cookies.set(refreshCookieName, "", {
    ...cookieOptions,
    path: "/api/auth",
    maxAge: 0,
    expires: epoch,
  });

  try {
    store.set(sessionCookieName, "", {
      ...cookieOptions,
      maxAge: 0,
      expires: epoch,
    });
    store.set(refreshCookieName, "", {
      ...cookieOptions,
      path: "/api/auth",
      maxAge: 0,
      expires: epoch,
    });
  } catch {}
  return res;
}
