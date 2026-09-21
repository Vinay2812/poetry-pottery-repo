"use client";

import {
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

import { DIRECTION_OPTIONS } from "@/features/admin/inbox/types";

export interface WhatsAppFiltersProps {
  search: string;
  direction: string;
  onSearchChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
}

export function WhatsAppFilters({
  search,
  direction,
  onSearchChange,
  onDirectionChange,
}: WhatsAppFiltersProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="whatsapp-search"
        label="Search"
        placeholder="Name, email or message"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="whatsapp-direction"
        label="Direction"
        anyLabel="Any"
        options={DIRECTION_OPTIONS}
        value={direction}
        onChange={onDirectionChange}
      />
    </AdminToolbar>
  );
}
