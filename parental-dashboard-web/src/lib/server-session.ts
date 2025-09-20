import "server-only";

import { cookies } from "next/headers";
import { dbPool } from "@/lib/db";

export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session_id";
  const sessionId = cookieStore.get(sessionCookieName)?.value;
  if (!sessionId) return null;

  const client = await dbPool.connect();
  try {
    const { rows } = await client.query(
      `SELECT s.id, s."expiresAt", s."userId", u.email, u.name
       FROM "session" s JOIN "user" u ON u.id = s."userId"
       WHERE s.token = $1`,
      [sessionId]
    );
    if (rows.length === 0) return null;
    const s = rows[0];
    const expiresAt = new Date(s.expiresAt);
    if (expiresAt.getTime() <= Date.now()) return null;
    return {
      user: { id: s.userId, email: s.email, name: s.name },
      session: { id: s.id, expiresAt },
    };
  } finally {
    client.release();
  }
}
