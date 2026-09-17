import { ApolloLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { SetContextLink } from "@apollo/client/link/context";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

import { createHttpLink } from "./links";

// clerkMiddleware stamps this on every request it handles; auth() throws without it.
const CLERK_AUTH_STATUS_HEADER = "x-clerk-auth-status";

// Forwarding the visitor address keeps server-side calls off the Next server's own rate limit,
// and reading the proxy's stamp keeps auth() from throwing on a render it never handled. Every
// query this client makes is public, so an unattributed render serves it signed out.
const forwardVisitor = new SetContextLink(async (prevContext) => {
  const incoming = await headers();
  const ip = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
  const token = incoming.has(CLERK_AUTH_STATUS_HEADER)
    ? await auth().then((session) => session.getToken())
    : null;
  return {
    headers: {
      ...(prevContext.headers as Record<string, string> | undefined),
      ...(ip ? { "x-forwarded-for": ip } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const { getClient, query, PreloadQuery } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([forwardVisitor, createHttpLink()]),
    }),
);
