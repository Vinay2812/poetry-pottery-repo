import { create } from "zustand";

export interface UIState {
  isSignInPromptOpen: boolean;
  openSignInPrompt: () => void;
  closeSignInPrompt: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSignInPromptOpen: false,
  openSignInPrompt: () => set({ isSignInPromptOpen: true }),
  closeSignInPrompt: () => set({ isSignInPromptOpen: false }),
}));
