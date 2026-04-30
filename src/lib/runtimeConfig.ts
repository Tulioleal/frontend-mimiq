type RuntimeConfig = {
  wsBaseUrl: string;
};

let runtimeConfigPromise: Promise<RuntimeConfig> | undefined;

export function getRuntimeConfig() {
  runtimeConfigPromise ??= fetch("/api/runtime-config", { credentials: "include" }).then(async (response) => {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.detail ?? "Runtime config is unavailable.");
    }

    if (!payload?.wsBaseUrl || typeof payload.wsBaseUrl !== "string") {
      throw new Error("Runtime config response is missing wsBaseUrl.");
    }

    return { wsBaseUrl: payload.wsBaseUrl.replace(/\/$/, "") };
  });

  return runtimeConfigPromise;
}
