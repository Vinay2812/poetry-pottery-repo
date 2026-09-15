"use client";

import { ApolloLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { useApolloClient } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, type PropsWithChildren } from "react";

import { createAuthLink, createHttpLink, type TokenGetter } from "./links";

function makeClient(getToken: TokenGetter): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([createAuthLink(getToken), createHttpLink()]),
  });
}

const USER_SCOPED_FIELDS = [
  "cart",
  "wishlist",
  "wishlistIds",
  "addresses",
  "orders",
  "order",
  "checkoutQuote",
];

// Sign-out and account switches must not leave the previous person's data in the cache.
function EvictUserFieldsOnUserChange() {
  const { userId } = useAuth();
  const client = useApolloClient();
  const lastUserId = useRef(userId);

  useEffect(() => {
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;
    for (const fieldName of USER_SCOPED_FIELDS) {
      client.cache.evict({ id: "ROOT_QUERY", fieldName });
    }
    client.cache.gc();
  }, [client, userId]);

  return null;
}

export function ApolloProvider({ children }: PropsWithChildren) {
  const { getToken } = useAuth();
  const tokenRef = useRef<TokenGetter>(getToken);

  useEffect(() => {
    tokenRef.current = getToken;
  }, [getToken]);

  const createClient = useCallback(
    () => makeClient(() => tokenRef.current()),
    [],
  );

  return (
    <ApolloNextAppProvider makeClient={createClient}>
      <EvictUserFieldsOnUserChange />
      {children}
    </ApolloNextAppProvider>
  );
}
