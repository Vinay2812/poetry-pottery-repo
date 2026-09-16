export { AdminRail } from "@/features/admin/shell/components/AdminRail";
export { AdminSectionStrip } from "@/features/admin/shell/components/AdminSectionStrip";
export { AdminTopBar } from "@/features/admin/shell/components/AdminTopBar";
export { AdminChromeContainer } from "@/features/admin/shell/containers/AdminChromeContainer";
export {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell/hooks";
export {
  ADMIN_NAV_LINKS,
  type AdminNavLink,
  applyQueryPatch,
  formatEnumLabel,
  formatRange,
  isNavLinkActive,
  type QueryPatch,
  type QueryValues,
  readPage,
  readQueryValues,
  toPageNumber,
  toQueryString,
} from "@/features/admin/shell/types";
