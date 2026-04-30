import type { GpuState, GpuStatus, Voice } from "./types";

type ApiRecord = Record<string, unknown>;

function stringValue(value: unknown, fallback?: string) {
  return typeof value === "string" ? value : fallback;
}

export function mapVoice(raw: ApiRecord): Voice {
  const waveform = Array.isArray(raw.waveform) ? raw.waveform.map(Number) : undefined;
  return {
    id: String(raw.id),
    name: stringValue(raw.name, "Untitled voice") ?? "Untitled voice",
    duration: Number(raw.duration ?? raw.duration_seconds ?? 0),
    createdAt:
      stringValue(raw.createdAt, stringValue(raw.created_at, new Date().toISOString())) ?? new Date().toISOString(),
    previewUrl: stringValue(raw.previewUrl, stringValue(raw.preview_url, stringValue(raw.audio_url))),
    waveform
  };
}

export function mapGpuStatus(raw: ApiRecord): GpuStatus {
  const allowed: GpuState[] = ["offline", "booting", "ready"];
  const rawState = raw.status ?? raw.state;
  const state: GpuState =
    typeof rawState === "string" && allowed.includes(rawState as GpuState) ? (rawState as GpuState) : "error";
  return {
    state,
    message: stringValue(raw.detail, stringValue(raw.message)),
    updatedAt: stringValue(raw.updatedAt, stringValue(raw.updated_at))
  };
}
