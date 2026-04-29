import { create } from "zustand";

type AuthState = {
  sessionExpiredMessage?: string;
  setSessionExpired: (message?: string) => void;
  clearAuthUi: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  setSessionExpired: (sessionExpiredMessage) => set({ sessionExpiredMessage }),
  clearAuthUi: () => set({ sessionExpiredMessage: undefined })
}));
