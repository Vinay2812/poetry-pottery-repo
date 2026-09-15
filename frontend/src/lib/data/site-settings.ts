import {
  SiteSettingsDocument,
  type SiteSettingsQuery,
  type SiteSettingsQueryVariables,
} from "@/graphql/generated/graphql";
import { getClient } from "@/lib/apollo/rsc-client";

export type SiteSettings = SiteSettingsQuery["siteSettings"];

// Server components share one Apollo client per request, so repeated calls hit the cache.
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await getClient().query<
    SiteSettingsQuery,
    SiteSettingsQueryVariables
  >({ query: SiteSettingsDocument });
  if (!data) {
    throw new Error("Site settings are unavailable");
  }
  return data.siteSettings;
}
