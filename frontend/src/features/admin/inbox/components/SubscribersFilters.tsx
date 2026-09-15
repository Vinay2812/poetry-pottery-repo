"use client";

import { Button } from "@/components/ui/button";

import {
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

import { ACTIVE_OPTIONS } from "@/features/admin/inbox/types";

export interface SubscribersFiltersProps {
  search: string;
  activeState: string;
  isExporting: boolean;
  onSearchChange: (value: string) => void;
  onActiveStateChange: (value: string) => void;
  onExport: () => void;
}

export function SubscribersFilters({
  search,
  activeState,
  isExporting,
  onSearchChange,
  onActiveStateChange,
  onExport,
}: SubscribersFiltersProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="subscribers-search"
        label="Search"
        placeholder="Email"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="subscribers-active"
        label="Status"
        anyLabel="Any"
        options={ACTIVE_OPTIONS}
        value={activeState}
        onChange={onActiveStateChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isExporting}
        onClick={onExport}
      >
        {isExporting ? "Exporting…" : "Export CSV"}
      </Button>
    </AdminToolbar>
  );
}
