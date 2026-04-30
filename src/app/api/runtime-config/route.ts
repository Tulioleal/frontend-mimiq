const PUBLIC_WS_BASE_URL = process.env.PUBLIC_WS_BASE_URL?.trim().replace(/\/$/, "");

export function GET() {
  if (!PUBLIC_WS_BASE_URL) {
    return Response.json({ detail: "PUBLIC_WS_BASE_URL is not configured." }, { status: 500 });
  }

  try {
    const url = new URL(PUBLIC_WS_BASE_URL);
    if (!["ws:", "wss:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return Response.json({ detail: "PUBLIC_WS_BASE_URL must be an absolute ws:// or wss:// URL." }, { status: 500 });
  }

  return Response.json({ wsBaseUrl: PUBLIC_WS_BASE_URL });
}
