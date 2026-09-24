import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type UrlCodec, useUrlState } from "./use-url-state";

const navigation = vi.hoisted(() => ({
  search: new URLSearchParams(),
  replace: vi.fn<(href: string, options: { scroll: boolean }) => void>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/shop",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.search,
}));

interface Filters {
  tags: string[];
  sort: string;
}

type Action = { type: "tag"; tag: string } | { type: "sort"; sort: string };

const CODEC: UrlCodec<Filters, Action> = {
  parse: (search) => ({
    tags: search.getAll("tag"),
    sort: search.get("sort") ?? "new",
  }),
  serialize: (filters) => {
    const search = new URLSearchParams();
    for (const tag of filters.tags) search.append("tag", tag);
    if (filters.sort !== "new") search.set("sort", filters.sort);
    return search.toString();
  },
  apply: (filters, action) =>
    action.type === "tag"
      ? { ...filters, tags: [...filters.tags, action.tag] }
      : { ...filters, sort: action.sort },
};

function navigateTo(query: string) {
  navigation.search = new URLSearchParams(query);
}

describe("useUrlState", () => {
  beforeEach(() => {
    navigateTo("");
    navigation.replace.mockReset();
    // A finished navigation lands the new query in the address bar.
    navigation.replace.mockImplementation((href) => {
      navigateTo(href.split("?")[1] ?? "");
    });
  });

  it("reads its value from the address bar", () => {
    navigateTo("tag=mug&sort=price");
    const { result } = renderHook(() => useUrlState(CODEC));

    expect(result.current.value).toEqual({ tags: ["mug"], sort: "price" });
    expect(result.current.isPending).toBe(false);
  });

  it("replaces the URL without scrolling and follows it once it lands", () => {
    const { result } = renderHook(() => useUrlState(CODEC));

    act(() => result.current.dispatch({ type: "tag", tag: "mug" }));

    expect(navigation.replace).toHaveBeenCalledWith("/shop?tag=mug", {
      scroll: false,
    });
    expect(result.current.value).toEqual({ tags: ["mug"], sort: "new" });
    expect(result.current.isPending).toBe(false);
  });

  it("stacks rapid changes instead of letting the last one win", () => {
    // The router has not caught up yet, so the address bar still says nothing.
    navigation.replace.mockImplementation(() => undefined);
    const { result } = renderHook(() => useUrlState(CODEC));

    act(() => {
      result.current.dispatch({ type: "tag", tag: "mug" });
      result.current.dispatch({ type: "tag", tag: "bowl" });
      result.current.dispatch({ type: "sort", sort: "price" });
    });

    expect(navigation.replace).toHaveBeenLastCalledWith(
      "/shop?tag=mug&tag=bowl&sort=price",
      { scroll: false },
    );
  });

  it("builds on a URL changed from outside, such as the back button", () => {
    navigateTo("tag=mug");
    const { result, rerender } = renderHook(() => useUrlState(CODEC));

    navigateTo("tag=vase");
    rerender();
    expect(result.current.value.tags).toEqual(["vase"]);

    act(() => result.current.dispatch({ type: "tag", tag: "bowl" }));
    expect(navigation.replace).toHaveBeenLastCalledWith(
      "/shop?tag=vase&tag=bowl",
      { scroll: false },
    );
  });

  it("links to a value, falling back to the bare path", () => {
    const { result } = renderHook(() => useUrlState(CODEC));

    expect(result.current.toHref({ tags: [], sort: "new" })).toBe("/shop");
    expect(result.current.toHref({ tags: ["mug"], sort: "old" })).toBe(
      "/shop?tag=mug&sort=old",
    );
  });
});
