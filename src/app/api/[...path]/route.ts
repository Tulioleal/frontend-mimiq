import { NextRequest } from "next/server";

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL?.replace(/\/$/, "");
const HOP_BY_HOP_HEADERS = new Set(["connection", "content-length", "host", "keep-alive", "transfer-encoding"]);

function getBackendUrl(path: string[], request: NextRequest) {
  if (!BACKEND_API_BASE_URL) {
    throw new Error("BACKEND_API_BASE_URL is required when using the same-origin API proxy.");
  }

  const url = new URL(`/api/${path.join("/")}`, BACKEND_API_BASE_URL);
  url.search = request.nextUrl.search;
  return url;
}

function getForwardHeaders(request: NextRequest) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

function getResponseHeaders(response: Response) {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const method = request.method.toUpperCase();
    const backendResponse = await fetch(getBackendUrl(path, request), {
      method,
      headers: getForwardHeaders(request),
      body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
      redirect: "manual"
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: getResponseHeaders(backendResponse)
    });
  } catch (error) {
    return Response.json(
      { detail: error instanceof Error ? error.message : "Frontend API proxy failed." },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
