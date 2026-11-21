export interface PageTurn {
  // The page whose rows are on screen, which is what the pager names.
  shownPage: number;
  // A page that was asked for but failed to replace them, so it can be asked for again.
  failedPage: number | null;
}

// While a page loads the pager already names it; once it fails, the pager steps back to the rows still shown.
export function toPageTurn(
  requestedPage: number,
  resultPage: number | null,
  hasError: boolean,
): PageTurn {
  if (hasError && resultPage !== null && resultPage !== requestedPage) {
    return { shownPage: resultPage, failedPage: requestedPage };
  }
  return { shownPage: requestedPage, failedPage: null };
}
