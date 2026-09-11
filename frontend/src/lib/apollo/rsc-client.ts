import { ApolloLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { SetContextLink } from "@apollo/client/link/context";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

import { createAuthLink, createHttpLink } from "./links";

async function getServerToken(): Promise<string | null> {
  const session = await auth();
  return session.getToken();
}

// Without this every server-side call would be rate limited as the Next server's own address.
const forwardVisitorIp = new SetContextLink(async (prevContext) => {
  const incoming = await headers();
  const ip = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
  return {
    headers: {
      ...(prevContext.headers as Record<string, string> | undefined),
      ...(ip ? { "x-forwarded-for": ip } : {}),
    },
  };
});

export const { getClient, query, PreloadQuery } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthLink(getServerToken),
        forwardVisitorIp,
        createHttpLink(),
      ]),
    }),
);
