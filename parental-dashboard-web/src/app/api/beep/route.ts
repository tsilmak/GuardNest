export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return new Response("boop", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Short cache to reduce repeated dynamic work, still effectively fresh in dev
        "Cache-Control": "public, max-age=30, s-maxage=30",
      },
    });
  } catch {
    return new Response("error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
}
