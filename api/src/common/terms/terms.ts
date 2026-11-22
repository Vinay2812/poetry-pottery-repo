import { BadRequestException } from "@nestjs/common";

export const TERMS_REQUIRED = "Please agree to the terms to continue.";

// Nothing is stored: refusing every request without the tick is the record that it was given.
export function assertAcceptedTerms(
  accepted: boolean | null | undefined,
): void {
  if (accepted !== true) {
    throw new BadRequestException(TERMS_REQUIRED);
  }
}
