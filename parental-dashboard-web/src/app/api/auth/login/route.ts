import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { randomBytes } from "crypto";
import { dbPool } from "@/lib/db";

type Body = { email: string; password: string };

function createOpaqueToken(bytes: number = 32) {
  return randomBytes(bytes).toString("hex");
}

function isValidCookieDomain(domain: string) {
  // Validate cookie domain
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
  try {
    const body = (await req.json()) as Body;
    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { error: "missing credentials" },
        { status: 400 }
      );
    }
    if (body.email.length > 255) {
      return NextResponse.json({ error: "email too long" }, { status: 400 });
    }

    // Verify credentials via Better Auth
    const verifyRes = await fetch(
      `${req.nextUrl.origin}/api/auth/sign-in/email`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: body.email, password: body.password }),
        // Just verifying credentials
      }
    );
    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }
    type SignInUser = { id?: string };
    type SignInResponse = { data?: { user?: SignInUser }; user?: SignInUser };
    const rawJson: unknown = await verifyRes.json().catch(() => ({}));
    const verifyJson = rawJson as Partial<SignInResponse>;
    const userId: string | undefined =
      verifyJson.data?.user?.id ?? verifyJson.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const client = await dbPool.connect();
    try {
      // Clean up auto-created session
      await client.query(
        `DELETE FROM "session" 
         WHERE "userId" = $1 
         AND "userAgent" = $2 
         AND "createdAt" > CURRENT_TIMESTAMP - INTERVAL '1 minute'`,
        [userId, "node"]
      );

      await client.query("BEGIN");
      // Ensure refresh token columns exist
      await client.query(
        'ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "refreshToken" text'
      );
      await client.query(
        'ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "refreshExpiresAt" timestamp'
      );

      const sessionId = createOpaqueToken(32);
      const refreshToken = createOpaqueToken(32);
      const now = new Date();
      const sessionTtlSeconds =
        Number(process.env.SESSION_TTL_SECONDS) || 60 * 60; // 1h default
      const refreshTtlSeconds =
        Number(process.env.REFRESH_TTL_SECONDS) || 60 * 60 * 24 * 7; // 7d default
      const expiresAt = new Date(now.getTime() + sessionTtlSeconds * 1000);
      const refreshExpiresAt = new Date(
        now.getTime() + refreshTtlSeconds * 1000
      );

      // Insert session record
      await client.query(
        `INSERT INTO "session" (id, token, "expiresAt", "createdAt", "updatedAt", "userId", "refreshToken", "refreshExpiresAt")
         VALUES ($1, $2, $3, $4, $4, $5, $6, $7)`,
        [
          sessionId,
          sessionId,
          expiresAt,
          now,
          userId,
          refreshToken,
          refreshExpiresAt,
        ]
      );

      // Redis alternative (uncomment when ready):
      // await redis.setEx(`session:${sessionId}`, sessionTtlSeconds, JSON.stringify({ userId, expiresAt }))
      // await redis.setEx(`refresh:${refreshToken}`, refreshTtlSeconds, JSON.stringify({ sessionId, userId }))

      await client.query("COMMIT");

      const res = NextResponse.json({ ok: true });
      const cookieOptions = getCookieOptions();
      // Set auth cookies
      res.cookies.set(
        process.env.SESSION_COOKIE_NAME ?? "session_id",
        sessionId,
        {
          ...cookieOptions,
          maxAge: sessionTtlSeconds,
          expires: expiresAt,
        }
      );
      res.cookies.set(
        process.env.REFRESH_COOKIE_NAME ?? "refresh_token",
        refreshToken,
        {
          ...cookieOptions,
          path: "/api/auth",
          maxAge: refreshTtlSeconds,
          expires: refreshExpiresAt,
        }
      );

      // Also set via dynamic cookies for dev compatibility
      try {
        const store = await cookies();
        store.set(
          process.env.SESSION_COOKIE_NAME ?? "session_id",
          sessionId,
          cookieOptions
        );
        store.set(
          process.env.REFRESH_COOKIE_NAME ?? "refresh_token",
          refreshToken,
          {
            ...cookieOptions,
            path: "/api/auth",
          }
        );
      } catch {}
      return res;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("/api/auth/login error", err);
    const res = NextResponse.json({ error: "internal" }, { status: 500 });
    // Cleanup cookies on error
    const cookieOptions = getCookieOptions();
    res.cookies.set(process.env.SESSION_COOKIE_NAME ?? "session_id", "", {
      ...cookieOptions,
      maxAge: 0,
    });
    res.cookies.set(process.env.REFRESH_COOKIE_NAME ?? "refresh_token", "", {
      ...cookieOptions,
      maxAge: 0,
    });
    return res;
  }
}
