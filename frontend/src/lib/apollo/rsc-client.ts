import { ApolloLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { auth } from "@clerk/nextjs/server";

import { createAuthLink, createHttpLink } from "./links";

async function getServerToken(): Promise<string | null> {
  const session = await auth();
  return session.getToken();
}

export const { getClient, query, PreloadQuery } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([createAuthLink(getServerToken), createHttpLink()]),
    }),
);
