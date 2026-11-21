const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return INR.format(amount);
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const DATE_LONG = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const TIME_SHORT = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const SHORT_DAY = new Map<string, Intl.DateTimeFormat>();

// "Sun 22 Nov": the day every event and wheel-session line uses, without en-IN's comma or "Sept".
export function formatShortDay(value: string | Date, timeZone: string): string {
  let formatter = SHORT_DAY.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone,
    });
    SHORT_DAY.set(timeZone, formatter);
  }
  return formatter
    .format(new Date(value))
    .replace(/,/g, "")
    .replace("Sept", "Sep");
}

export function formatDate(value: string | Date): string {
  return DATE_LONG.format(new Date(value)).replace("Sept", "Sep");
}

export function formatTime(value: string | Date): string {
  return TIME_SHORT.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

// A tel: URI takes no spaces or dashes; a studio with no number on file gets no link at all.
export function toPhoneHref(phone: string): string | null {
  const dialable = phone.replace(/[\s-]/g, "");
  return dialable.length > 0 ? `tel:${dialable}` : null;
}
