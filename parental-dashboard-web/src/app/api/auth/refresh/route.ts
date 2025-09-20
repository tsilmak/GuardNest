import { cookies as dynamicCookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { randomBytes } from "crypto";
import { dbPool } from "@/lib/db";

function createOpaqueToken(bytes: number = 32) {
  return randomBytes(bytes).toString("hex");
}

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
};

function getCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const base: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  };
  // Use host-only cookies in dev
  return base;
}

export async function POST(req: NextRequest) {
  const cookieOptions = getCookieOptions();
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session_id";
  const refreshCookieName = process.env.REFRESH_COOKIE_NAME ?? "refresh_token";
  const store = await dynamicCookies();
  const _sessionId = store.get(sessionCookieName)?.value;
  const refreshToken = store.get(refreshCookieName)?.value;

  if (!refreshToken) {
    // Fallback: read from request headers
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMap = Object.fromEntries(
      cookieHeader
        .split(/;\s*/)
        .filter(Boolean)
        .map((c) => c.split("=") as [string, string])
    );
    const rt = cookieMap[refreshCookieName];
    if (rt) {
      return NextResponse.json({ ok: true, note: "retry" }, { status: 425 });
    }
    return NextResponse.json(
      { error: "missing refresh token" },
      { status: 401 }
    );
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    const now = new Date();
    const { rows } = await client.query(
      `SELECT id, "userId", "expiresAt", "refreshToken", "refreshExpiresAt"
       FROM "session" WHERE "refreshToken" = $1`,
      [refreshToken]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      const res = NextResponse.json(
        { error: "invalid refresh" },
        { status: 401 }
      );
      res.cookies.set(sessionCookieName, "", { ...cookieOptions, maxAge: 0 });
      res.cookies.set(refreshCookieName, "", { ...cookieOptions, maxAge: 0 });
      return res;
    }
    const sess = rows[0] as {
      id: string;
      userId: string;
      expiresAt: Date;
      refreshToken: string;
      refreshExpiresAt: Date;
    };

    if (new Date(sess.refreshExpiresAt).getTime() <= now.getTime()) {
      await client.query("ROLLBACK");
      const res = NextResponse.json(
        { error: "refresh expired" },
        { status: 401 }
      );
      res.cookies.set(sessionCookieName, "", { ...cookieOptions, maxAge: 0 });
      res.cookies.set(refreshCookieName, "", { ...cookieOptions, maxAge: 0 });
      return res;
    }

    // Rotate tokens
    const newSessionId = createOpaqueToken(32);
    const newRefreshToken = createOpaqueToken(32);
    const sessionTtlSeconds =
      Number(process.env.SESSION_TTL_SECONDS) || 60 * 60;
    const refreshTtlSeconds =
      Number(process.env.REFRESH_TTL_SECONDS) || 60 * 60 * 24 * 7;
    const newExpiresAt = new Date(now.getTime() + sessionTtlSeconds * 1000);
    const newRefreshExpiresAt = new Date(
      now.getTime() + refreshTtlSeconds * 1000
    );

    await client.query(
      `UPDATE "session"
       SET id = $1, token = $1, "expiresAt" = $2, "updatedAt" = $3,
           "refreshToken" = $4, "refreshExpiresAt" = $5
       WHERE "refreshToken" = $6`,
      [
        newSessionId,
        newExpiresAt,
        now,
        newRefreshToken,
        newRefreshExpiresAt,
        refreshToken,
      ]
    );

    await client.query("COMMIT");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName, newSessionId, {
      ...cookieOptions,
      maxAge: sessionTtlSeconds,
      expires: newExpiresAt,
    });
    res.cookies.set(refreshCookieName, newRefreshToken, {
      ...cookieOptions,
      path: "/api/auth",
      maxAge: refreshTtlSeconds,
      expires: newRefreshExpiresAt,
    });

    // Also set via dynamic cookies for dev compatibility
    try {
      store.set(sessionCookieName, newSessionId);
      store.set(refreshCookieName, newRefreshToken);
    } catch {}
    return res;
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("/api/auth/refresh error", e);
    const res = NextResponse.json({ error: "internal" }, { status: 500 });
    res.cookies.set(sessionCookieName, "", { ...cookieOptions, maxAge: 0 });
    res.cookies.set(refreshCookieName, "", { ...cookieOptions, maxAge: 0 });
    return res;
  } finally {
    client.release();
  }
}
