import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const name = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    process.env[name] ??= value;
  }
}

const required = ["NEXT_PUBLIC_WS_BASE_URL"];

const missing = required.filter((name) => !process.env[name]?.trim());
const hasDirectApiUrl = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());
const hasProxyApiUrl = Boolean(process.env.BACKEND_API_BASE_URL?.trim());

if (!hasDirectApiUrl && !hasProxyApiUrl) {
  missing.push("NEXT_PUBLIC_API_BASE_URL or BACKEND_API_BASE_URL");
}

if (missing.length > 0) {
  console.error(`Missing required public build environment variables: ${missing.join(", ")}`);
  console.error("These values are baked into the browser bundle during `next build`.");
  process.exit(1);
}

for (const name of ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_WS_BASE_URL", "BACKEND_API_BASE_URL"]) {
  if (!process.env[name]?.trim()) continue;

  try {
    const value = process.env[name];
    const url = new URL(value);
    const validProtocol = name.includes("WS")
      ? ["ws:", "wss:"].includes(url.protocol)
      : ["http:", "https:"].includes(url.protocol);

    if (!validProtocol) {
      throw new Error(`Invalid protocol ${url.protocol}`);
    }
  } catch {
    console.error(`${name} must be an absolute URL with a valid protocol.`);
    process.exit(1);
  }
}
