import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (email.length > 255) {
      return NextResponse.json({ error: "Email too long" }, { status: 400 });
    }

    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT "id" FROM "user" WHERE "email" = $1',
        [email]
      );

      const exists = result.rows.length > 0;

      return NextResponse.json({ exists });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("/api/auth/check-email error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
