import { create } from "zustand";
import type { AudioHealthReport } from "@/lib/api/types";

type RecordingState = {
  elapsed: number;
  blob?: Blob;
  previewUrl?: string;
  report?: AudioHealthReport;
  setElapsed: (elapsed: number) => void;
  setBlob: (blob?: Blob) => void;
  setReport: (report?: AudioHealthReport) => void;
  reset: () => void;
};

export const useRecordingStore = create<RecordingState>((set, get) => ({
  elapsed: 0,
  setElapsed: (elapsed) => set({ elapsed }),
  setBlob: (blob) => {
    const current = get().previewUrl;
    if (current) URL.revokeObjectURL(current);
    set({ blob, previewUrl: blob ? URL.createObjectURL(blob) : undefined });
  },
  setReport: (report) => set({ report }),
  reset: () => {
    const current = get().previewUrl;
    if (current) URL.revokeObjectURL(current);
    set({ elapsed: 0, blob: undefined, previewUrl: undefined, report: undefined });
  }
}));
