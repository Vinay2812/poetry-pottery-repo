/** The zone every studio falls back to when the stored one no longer resolves. */
export const DEFAULT_TIME_ZONE = "Asia/Kolkata";

/** Intl throws a RangeError on anything that is not an IANA identifier. */
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function supportedTimeZones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  return zones.includes(DEFAULT_TIME_ZONE)
    ? zones
    : [DEFAULT_TIME_ZONE, ...zones];
}

/** Keeps a page readable when the stored zone is junk, rather than throwing mid-render. */
export function safeTimeZone(value: string): string {
  return isTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}
