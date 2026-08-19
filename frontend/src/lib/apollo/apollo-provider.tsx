"use client";

import { ApolloLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, type PropsWithChildren } from "react";

import { createAuthLink, createHttpLink, type TokenGetter } from "./links";

function makeClient(getToken: TokenGetter): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([createAuthLink(getToken), createHttpLink()]),
  });
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
      {children}
    </ApolloNextAppProvider>
  );
}
