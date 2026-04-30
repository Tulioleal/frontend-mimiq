for (const name of ["NEXT_PUBLIC_API_BASE_URL"]) {
  if (!process.env[name]?.trim()) continue;

  try {
    const value = process.env[name];
    const url = new URL(value);
    const validProtocol = ["http:", "https:"].includes(url.protocol);

    if (!validProtocol) {
      throw new Error(`Invalid protocol ${url.protocol}`);
    }
  } catch {
    console.error(`${name} must be an absolute URL with a valid protocol.`);
    process.exit(1);
  }
}
