import { describe, expect, it } from "vitest";

import { AppModule } from "@/app.module";
import * as resolvers from "@/resolvers";
import {
  isResolver,
  namesOf,
  providedResolvers,
} from "@test/helpers/nest-modules";

// schema:emit reads the barrel while the running API reads the modules, so the two must never drift apart.
describe("resolvers barrel", () => {
  it("holds exactly the resolvers the app's modules provide", async () => {
    const provided = await providedResolvers(AppModule);

    expect(namesOf(Object.values(resolvers))).toEqual(namesOf(provided));
    expect(new Set(Object.values(resolvers))).toEqual(provided);
  });

  it("exports nothing but resolvers", () => {
    for (const [name, exported] of Object.entries(resolvers)) {
      expect(isResolver(exported), name).toBe(true);
    }
  });
});
