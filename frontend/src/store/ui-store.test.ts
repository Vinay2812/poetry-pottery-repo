import { beforeEach, describe, expect, it } from "vitest";

import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ isSignInPromptOpen: false, toastMessage: null });
  });

  it("opens and closes the sign-in prompt", () => {
    useUIStore.getState().openSignInPrompt();
    expect(useUIStore.getState().isSignInPromptOpen).toBe(true);

    useUIStore.getState().closeSignInPrompt();
    expect(useUIStore.getState().isSignInPromptOpen).toBe(false);
  });

  it("shows and dismisses a toast", () => {
    useUIStore.getState().showToast("Saved");
    expect(useUIStore.getState().toastMessage).toBe("Saved");

    useUIStore.getState().dismissToast();
    expect(useUIStore.getState().toastMessage).toBeNull();
  });
});
