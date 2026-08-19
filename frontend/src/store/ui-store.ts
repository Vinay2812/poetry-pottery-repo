import { create } from "zustand";

export interface UIState {
  isSignInPromptOpen: boolean;
  toastMessage: string | null;
  openSignInPrompt: () => void;
  closeSignInPrompt: () => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSignInPromptOpen: false,
  toastMessage: null,
  openSignInPrompt: () => set({ isSignInPromptOpen: true }),
  closeSignInPrompt: () => set({ isSignInPromptOpen: false }),
  showToast: (message) => set({ toastMessage: message }),
  dismissToast: () => set({ toastMessage: null }),
}));
