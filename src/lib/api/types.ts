export type GpuState = "offline" | "booting" | "ready" | "stale" | "error";

export type Session = { authenticated: boolean; user?: string };

export type WsTicket = { ticket: string; expiresInSeconds: number };

export type GpuStatus = { state: GpuState; message?: string; updatedAt?: string };

export type Voice = {
  id: string;
  name: string;
  duration: number;
  createdAt: string;
  previewUrl?: string;
  waveform?: number[];
};

export type AudioHealthItem =
  | string
  | {
      code?: string;
      message?: string;
      severity?: string;
    };

export type AudioHealthReport = {
  accepted: boolean;
  duration: number;
  peakDb?: number;
  noiseFloorDb?: number;
  issues: AudioHealthItem[];
  recommendations: AudioHealthItem[];
  voice?: Voice;
};

export type GenerationPayload = {
  type: "start_generation";
  voice_id: string;
  original_text: string;
  style_prompt: string;
  language: string;
  slider_config: {
    temperature: number;
    speech_speed: number;
    repetition_penalty: number;
  };
};

export type GenerationEvent =
  | { type: "ready" }
  | { type: "closed"; code?: number; reason?: string }
  | { type: "status"; status: GpuState; detail?: string }
  | { type: "accepted"; generation_id: string; rewritten_text: string }
  | { type: "completed"; generation_id: string; output_gcs_path: string; gpu_time_ms?: number; rtf?: number }
  | { type: "progress"; progress: number; message?: string }
  | { type: "chunk"; chunk: Blob }
  | { type: "download_ready"; url: string; generationId?: string }
  | { type: "complete"; url?: string; generationId?: string }
  | { type: "gpu_not_ready"; state: GpuState; message?: string }
  | { type: "error"; message: string };
