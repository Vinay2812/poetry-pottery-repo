import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useOneTimeLink } from "./use-one-time-link";

const LINES = { working: "Working…", done: "Done." };

function render(token: string, spend: (token: string) => Promise<boolean>) {
  return renderHook(() => useOneTimeLink(token, spend, LINES), {
    wrapper: StrictMode,
  });
}

const notFound = new CombinedGraphQLErrors({
  errors: [
    {
      message: "Not Found",
      extensions: { originalError: { statusCode: 404, message: "Not Found" } },
    },
  ],
});

describe("useOneTimeLink", () => {
  it("says the code is missing without calling the API", () => {
    const spend = vi.fn();
    const { result } = render("", spend);
    expect(result.current).toMatch(/missing its code/);
    expect(spend).not.toHaveBeenCalled();
  });

  it("spends the token once, even under strict mode", async () => {
    const spend = vi.fn().mockResolvedValue(true);
    const { result } = render("abc", spend);
    expect(result.current).toBe("Working…");
    await waitFor(() => expect(result.current).toBe("Done."));
    expect(spend).toHaveBeenCalledTimes(1);
    expect(spend).toHaveBeenCalledWith("abc");
  });

  it("calls a refused or unknown token spent", async () => {
    const refused = render("abc", vi.fn().mockResolvedValue(false));
    await waitFor(() =>
      expect(refused.result.current).toMatch(/already been used/),
    );
    const unknown = render("abc", vi.fn().mockRejectedValue(notFound));
    await waitFor(() =>
      expect(unknown.result.current).toMatch(/already been used/),
    );
  });

  it("asks for a retry when the studio could not be reached", async () => {
    const { result } = render("abc", vi.fn().mockRejectedValue(new Error("x")));
    await waitFor(() => expect(result.current).toMatch(/Try the link again/));
  });
});
