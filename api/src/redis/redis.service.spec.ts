import { describe, expect, it } from "vitest";

import { reviveDates } from "./redis.service";

describe("reviveDates", () => {
  it("turns ISO timestamps back into dates and leaves other strings alone", () => {
    const parsed = JSON.parse(
      JSON.stringify({
        ends_at: new Date("2026-12-31T23:59:59.000Z"),
        name: "Monsoon Greens",
        slug: "2026-12-31",
      }),
      reviveDates,
    ) as { ends_at: Date; name: string; slug: string };

    expect(parsed.ends_at).toBeInstanceOf(Date);
    expect(parsed.ends_at.toISOString()).toBe("2026-12-31T23:59:59.000Z");
    expect(parsed.name).toBe("Monsoon Greens");
    expect(parsed.slug).toBe("2026-12-31");
  });
});
