import { beforeEach, describe, expect, it } from "vitest";

import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ isSignInPromptOpen: false });
  });

  it("opens and closes the sign-in prompt", () => {
    useUIStore.getState().openSignInPrompt();
    expect(useUIStore.getState().isSignInPromptOpen).toBe(true);

    useUIStore.getState().closeSignInPrompt();
    expect(useUIStore.getState().isSignInPromptOpen).toBe(false);
  });
});
