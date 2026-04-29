export type GpuState = "offline" | "booting" | "ready" | "stale" | "error";

export type Session = { authenticated: boolean; user?: string };

export type GpuStatus = { state: GpuState; message?: string; updatedAt?: string };

export type Voice = {
  id: string;
  name: string;
  duration: number;
  createdAt: string;
  previewUrl?: string;
  waveform?: number[];
};

export type AudioHealthReport = {
  accepted: boolean;
  duration: number;
  peakDb?: number;
  noiseFloorDb?: number;
  issues: string[];
  recommendations: string[];
  voice?: Voice;
};

export type GenerationPayload = {
  voiceId: string;
  text: string;
  stylePrompt: string;
  temperature: number;
  speed: number;
  repetitionPenalty: number;
};

export type GenerationEvent =
  | { type: "ready" }
  | { type: "progress"; progress: number; message?: string }
  | { type: "chunk"; chunk: Blob }
  | { type: "download_ready"; url: string; generationId?: string }
  | { type: "complete"; url?: string; generationId?: string }
  | { type: "gpu_not_ready"; state: GpuState; message?: string }
  | { type: "error"; message: string };
