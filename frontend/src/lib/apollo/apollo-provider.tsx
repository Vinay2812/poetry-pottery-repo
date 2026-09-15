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

// Sign-out and account switches must not leave the previous person's data behind. Clearing
// the whole store beats keeping a list of user-scoped fields in step by hand.
function ClearStoreOnUserChange() {
  const { isLoaded, userId } = useAuth();
  const client = useApolloClient();
  // Clerk reports no user until it loads; that first settle is not an account change.
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    if (lastUserId.current === undefined) {
      lastUserId.current = userId;
      return;
    }
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;
    void client.clearStore();
  }, [client, isLoaded, userId]);

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
      <ClearStoreOnUserChange />
      {children}
    </ApolloNextAppProvider>
  );
}
