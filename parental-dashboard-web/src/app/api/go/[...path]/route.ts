import { NextRequest } from "next/server";

// Proxy requests to Go API with cookies

const API_BASE = process.env.NEXT_PUBLIC_GO_API_URL;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const url = `${API_BASE}/${params.path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      // Forward cookies
      cookie: req.headers.get("cookie") || "",
    },
    redirect: "manual",
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const url = `${API_BASE}/${params.path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") || "",
      "content-type": req.headers.get("content-type") || "application/json",
    },
    body: await req.text(),
    redirect: "manual",
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
