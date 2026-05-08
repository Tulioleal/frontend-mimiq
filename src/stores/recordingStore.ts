import { create } from "zustand";

type RecordingState = {
  elapsed: number;
  blob?: Blob;
  previewUrl?: string;
  setElapsed: (elapsed: number) => void;
  setBlob: (blob?: Blob) => void;
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
  reset: () => {
    const current = get().previewUrl;
    if (current) URL.revokeObjectURL(current);
    set({ elapsed: 0, blob: undefined, previewUrl: undefined });
  }
}));
