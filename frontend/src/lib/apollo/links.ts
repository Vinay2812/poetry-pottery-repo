import { HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

import { clientEnv } from "@/config/env";

export type TokenGetter = () => Promise<string | null>;

export function createHttpLink(): HttpLink {
  return new HttpLink({
    uri: clientEnv.NEXT_PUBLIC_API_URL,
    credentials: "include",
  });
}

/** Forwards the current auth session token as a bearer header. */
export function createAuthLink(getToken: TokenGetter): SetContextLink {
  return new SetContextLink(async (prevContext) => {
    const token = await getToken();
    const headers: Record<string, string> = {
      ...(prevContext.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    return { headers };
  });
}
