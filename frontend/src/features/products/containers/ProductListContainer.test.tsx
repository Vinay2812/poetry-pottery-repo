import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductsFilterInput } from "@/graphql/generated/graphql";

import { ProductListContainer } from "./ProductListContainer";
import { EMPTY_FILTERS, toFilterInput, toFilterKey } from "../types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// The card pulls in cart and wishlist state; the shelf's paging is what is under test here.
vi.mock("@/features/products/containers/ProductCardContainer", () => ({
  ProductCardContainer: ({ product }: { product: { name: string } }) => (
    <article>{product.name}</article>
  ),
}));

// Reports "in view" as soon as it starts watching, as a real observer does for a shopper
// already parked at the bottom of the shelf.
class InViewObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    queueMicrotask(() =>
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

class QuietResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function piece(id: number) {
  return {
    __typename: "Product",
    id,
    slug: `piece-${id}`,
    name: `Piece ${id}`,
    price: 500,
    compare_at_price: null,
    material: "Stoneware",
    color_name: null,
    color_code: null,
    glaze: null,
    image_urls: [],
    stock: 4,
    is_active: true,
    is_archived: false,
    is_featured: false,
    is_customizable: false,
    is_second: false,
    rating_avg: 0,
    rating_count: 0,
    collection: null,
  };
}

const FIRST_PAGE = {
  __typename: "ProductsResult",
  items: Array.from({ length: 24 }, (_, index) => piece(index + 1)),
  page_info: {
    __typename: "PageInfo",
    total: 30,
    page: 1,
    limit: 24,
    has_more: true,
  },
  facets: {
    __typename: "ProductFacets",
    categories: [],
    collections: [],
    materials: [],
    glazes: [],
    price_min: 0,
    price_max: 0,
    active_count: 30,
    archive_count: 0,
    seconds_count: 0,
  },
};

function failingSecondPageClient() {
  const pages: number[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const filter = operation.variables.filter as ProductsFilterInput;
        const page = filter.page ?? 1;
        pages.push(page);
        const timer = setTimeout(() => {
          if (page > 1) {
            observer.error(new Error("page two is down"));
            return;
          }
          observer.next({ data: { products: FIRST_PAGE } });
          observer.complete();
        }, 5);
        return () => clearTimeout(timer);
      }),
  );
  return {
    client: new ApolloClient({ link, cache: new InMemoryCache() }),
    secondPageRequests: () => pages.filter((page) => page > 1).length,
  };
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", InViewObserver);
  vi.stubGlobal("ResizeObserver", QuietResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProductListContainer paging", () => {
  it("asks for a failed next page once, then only when the shopper says try again", async () => {
    const { client, secondPageRequests } = failingSecondPageClient();
    render(
      <ApolloProvider client={client}>
        <ProductListContainer
          heading="Every piece on the shelf"
          description={null}
          initialProducts={FIRST_PAGE}
          initialFilterKey={toFilterKey(toFilterInput(EMPTY_FILTERS, 1))}
        />
      </ApolloProvider>,
    );

    const retry = await screen.findByRole("button", { name: "Try again" });
    // Long enough for a re-armed observer to have fired many times over.
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(secondPageRequests()).toBe(1);

    act(() => retry.click());
    await waitFor(() => expect(secondPageRequests()).toBe(2));
    await screen.findByRole("button", { name: "Try again" });
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(secondPageRequests()).toBe(2);
  });
});
