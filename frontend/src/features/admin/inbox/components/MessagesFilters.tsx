"use client";

import {
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

import { READ_OPTIONS } from "@/features/admin/inbox/types";

export interface MessagesFiltersProps {
  search: string;
  readState: string;
  onSearchChange: (value: string) => void;
  onReadStateChange: (value: string) => void;
}

export function MessagesFilters({
  search,
  readState,
  onSearchChange,
  onReadStateChange,
}: MessagesFiltersProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="messages-search"
        label="Search"
        placeholder="Name, email or message"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="messages-read"
        label="Status"
        anyLabel="Any"
        options={READ_OPTIONS}
        value={readState}
        onChange={onReadStateChange}
      />
    </AdminToolbar>
  );
}
