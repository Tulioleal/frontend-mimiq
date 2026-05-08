import type { AudioHealthItem, AudioHealthReport, GpuState, GpuStatus, Voice } from "./types";

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

function mapHealthItems(value: unknown): AudioHealthItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return [];

    const record = item as ApiRecord;
    return {
      code: stringValue(record.code),
      message: stringValue(record.message),
      severity: stringValue(record.severity)
    };
  });
}

export function mapAudioHealthReport(raw: ApiRecord): AudioHealthReport {
  const rawVoice = raw.voice ?? raw.candidate;

  return {
    accepted: Boolean(raw.accepted ?? raw.passed),
    duration: Number(raw.duration ?? raw.duration_seconds ?? 0),
    peakDb: raw.peakDb !== undefined || raw.peak_db !== undefined ? Number(raw.peakDb ?? raw.peak_db) : undefined,
    noiseFloorDb:
      raw.noiseFloorDb !== undefined || raw.noise_floor_db !== undefined
        ? Number(raw.noiseFloorDb ?? raw.noise_floor_db)
        : undefined,
    issues: mapHealthItems(raw.issues),
    recommendations: mapHealthItems(raw.recommendations),
    voice: rawVoice && typeof rawVoice === "object" ? mapVoice(rawVoice as ApiRecord) : undefined
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
