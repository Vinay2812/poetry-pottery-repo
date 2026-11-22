const INDIA_CODE = "91";

/** wa.me wants bare digits with the country code; a bare or 0-led Indian number gets 91 in front. */
export function toWhatsAppDigits(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 10) return `${INDIA_CODE}${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${INDIA_CODE}${digits.slice(1)}`;
  }
  return digits;
}

/** A number already carrying 91 is saved as typed; one without it is saved as 91XXXXXXXXXX. */
export function toStoredWhatsAppNumber(number: string): string {
  const trimmed = number.trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith(INDIA_CODE)
    ? trimmed
    : toWhatsAppDigits(trimmed);
}

export function buildWhatsAppUrl(number: string, text: string): string {
  return toWaMeUrl(toWhatsAppDigits(number), text);
}

// The same link, or null when the number has no digits to send to, read once either way.
export function buildOptionalWhatsAppUrl(
  number: string,
  text: string,
): string | null {
  const digits = toWhatsAppDigits(number);
  return digits ? toWaMeUrl(digits, text) : null;
}

function toWaMeUrl(digits: string, text: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
