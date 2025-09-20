import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authz = req.headers.get("authorization") || "";
  if (authz !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const client = await dbPool.connect();
  try {
    const now = new Date();
    const res = await client.query(
      `DELETE FROM "session" WHERE "expiresAt" <= $1 OR ("refreshExpiresAt" IS NOT NULL AND "refreshExpiresAt" <= $1)`,
      [now]
    );
    return NextResponse.json({ deleted: res.rowCount });
  } finally {
    client.release();
  }
}
