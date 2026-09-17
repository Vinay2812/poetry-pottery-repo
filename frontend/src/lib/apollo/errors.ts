import { CombinedGraphQLErrors } from "@apollo/client/errors";

// Nest's 404 travels inside the GraphQL error as the original HTTP exception. Anything the
// API answers with a missing row reads it, so the shape is described in exactly one place.
export function isNotFoundError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some((item) => {
    const original = item.extensions?.originalError as
      { statusCode?: number } | undefined;
    return original?.statusCode === 404;
  });
}
