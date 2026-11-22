// Matches the API's refusal, so the box and a refused request say the same thing.
export const TERMS_REQUIRED = "Please agree to the terms to continue.";

// The error waits for a submit, then clears as soon as the box is ticked.
export function toTermsError(
  isAccepted: boolean,
  hasTriedSubmit: boolean,
): string | null {
  return hasTriedSubmit && !isAccepted ? TERMS_REQUIRED : null;
}
