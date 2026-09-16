import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SuggestResolver } from "./suggest.resolver";
import { SuggestService } from "./suggest.service";

const suggestMock = { suggest: vi.fn<SuggestService["suggest"]>() };

describe("SuggestResolver", () => {
  let resolver: SuggestResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SuggestResolver,
        { provide: SuggestService, useValue: suggestMock },
      ],
    }).compile();
    resolver = moduleRef.get(SuggestResolver);
  });

  it("hands the term to the service untouched", async () => {
    const answer = { pieces: [], events: [], workshops: [] };
    suggestMock.suggest.mockResolvedValue(answer);

    await expect(resolver.suggest("  mug ")).resolves.toBe(answer);
    expect(suggestMock.suggest).toHaveBeenCalledWith("  mug ");
  });

  it("stays open to anyone, like the search page it feeds", () => {
    const handler = Object.getOwnPropertyDescriptor(
      SuggestResolver.prototype,
      "suggest",
    )?.value as (...args: never[]) => unknown;
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toBeUndefined();
  });
});
