import { Args, Query, Resolver } from "@nestjs/graphql";

import { SuggestService } from "./suggest.service";
import { Suggestions } from "./suggest.type";

@Resolver(() => Suggestions)
export class SuggestResolver {
  // Named apart from the field: an injected property called `suggest` would shadow the resolver.
  constructor(private readonly suggestions: SuggestService) {}

  @Query(() => Suggestions)
  suggest(@Args("q") q: string): Promise<Suggestions> {
    return this.suggestions.suggest(q);
  }
}
