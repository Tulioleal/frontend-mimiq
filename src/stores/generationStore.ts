import { create } from "zustand";

type GenerationState = {
  selectedVoiceId?: string;
  text: string;
  stylePrompt: string;
  temperature: number;
  speed: number;
  repetitionPenalty: number;
  setSelectedVoice: (id?: string) => void;
  updateDraft: (draft: Partial<Omit<GenerationState, "setSelectedVoice" | "updateDraft" | "resetDraft">>) => void;
  resetDraft: () => void;
};

const initial = { text: "", stylePrompt: "", temperature: 0.7, speed: 1, repetitionPenalty: 2 };

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initial,
  setSelectedVoice: (selectedVoiceId) => set({ selectedVoiceId }),
  updateDraft: (draft) => set(draft),
  resetDraft: () => set(initial)
}));
