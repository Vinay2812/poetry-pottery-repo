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

export function formatDate(value: string | Date): string {
  return DATE_LONG.format(new Date(value));
}

export function formatTime(value: string | Date): string {
  return TIME_SHORT.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

// A studio with no number on file would otherwise render a link with no text and nowhere to go.
export function toPhoneHref(phone: string): string | null {
  const trimmed = phone.trim();
  return trimmed.length > 0 ? `tel:${trimmed}` : null;
}
