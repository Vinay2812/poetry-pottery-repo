import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
  type TypedDocumentNode,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { usePageTrail } from "./use-page-trail";

interface Item {
  __typename: "Item";
  id: number;
}

interface ItemsPage {
  __typename: "ItemsPage";
  items: Item[];
  page_info: { __typename: "PageInfo"; page: number; has_more: boolean };
}

interface ItemsData {
  items: ItemsPage;
}

interface ItemsVariables {
  list: string;
  page: number;
}

const ITEMS: TypedDocumentNode<ItemsData, ItemsVariables> = gql`
  query Items($list: String!, $page: Int!) {
    items(list: $list, page: $page) {
      items {
        id
      }
      page_info {
        page
        has_more
      }
    }
  }
`;

function itemsPage(ids: number[], page: number, hasMore: boolean): ItemsPage {
  return {
    __typename: "ItemsPage",
    items: ids.map((id) => ({ __typename: "Item", id })),
    page_info: { __typename: "PageInfo", page, has_more: hasMore },
  };
}

const PAGE_ONE = itemsPage([1, 2], 1, true);
const PAGE_TWO = itemsPage([3, 4], 2, false);

// Each request waits until released, and the next one asked for page two can be made to fail.
function heldClient() {
  const log: string[] = [];
  const held: (() => void)[] = [];
  let failNext = false;
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const { list, page } = operation.variables as ItemsVariables;
        log.push(`${list} p${page}`);
        const isFailing = failNext;
        failNext = false;
        held.push(() => {
          if (isFailing) {
            observer.error(new Error("down"));
            return;
          }
          observer.next({ data: { items: PAGE_TWO } });
          observer.complete();
        });
      }),
  );
  return {
    client: new ApolloClient({ link, cache: new InMemoryCache() }),
    log,
    release: () => held.splice(0).forEach((finish) => finish()),
    failNextRequest: () => {
      failNext = true;
    },
  };
}

function renderTrail(client: ApolloClient) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return renderHook(
    ({ list }: { list: string }) =>
      usePageTrail({
        query: ITEMS,
        filterKey: list,
        toVariables: (page) => ({ list, page }),
        toPage: (data) => data.items,
        firstPage: PAGE_ONE,
        previousFirstPage: undefined,
        canAskNextPage: true,
      }),
    { wrapper, initialProps: { list: "mugs" } },
  );
}

const ids = (page: ItemsPage | undefined) => page?.items.map((item) => item.id);

describe("usePageTrail", () => {
  it("asks for a page once, however fast it is asked for", async () => {
    const { client, log, release } = heldClient();
    const { result } = renderTrail(client);

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    act(() => result.current.loadMore());
    expect(result.current.isNextPageLoading).toBe(true);

    await act(async () => release());
    await waitFor(() => expect(ids(result.current.list)).toEqual([1, 2, 3, 4]));
    expect(log).toEqual(["mugs p2"]);
  });

  it("keeps the list and asks again after a failed page", async () => {
    const { client, log, release, failNextRequest } = heldClient();
    const { result } = renderTrail(client);

    failNextRequest();
    act(() => result.current.loadMore());
    await act(async () => release());
    await waitFor(() => expect(result.current.hasNextPageFailed).toBe(true));
    expect(ids(result.current.list)).toEqual([1, 2]);

    act(() => result.current.loadMore());
    await act(async () => release());
    await waitFor(() => expect(ids(result.current.list)).toEqual([1, 2, 3, 4]));
    expect(log).toEqual(["mugs p2", "mugs p2"]);
  });

  it("lets a page go when it lands under other filters", async () => {
    const { client, release } = heldClient();
    const { result, rerender } = renderTrail(client);

    act(() => result.current.loadMore());
    rerender({ list: "bowls" });
    await act(async () => release());
    rerender({ list: "mugs" });

    expect(ids(result.current.list)).toEqual([1, 2]);
    expect(result.current.isNextPageLoading).toBe(false);
  });

  it("starts again from page one when it is read again", async () => {
    const { client, release } = heldClient();
    const { result } = renderTrail(client);

    act(() => result.current.loadMore());
    await act(async () => release());
    await waitFor(() => expect(ids(result.current.list)).toHaveLength(4));

    act(() => result.current.restart());
    expect(ids(result.current.list)).toEqual([1, 2]);
  });
});
