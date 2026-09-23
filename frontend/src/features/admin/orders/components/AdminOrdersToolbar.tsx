"use client";

import { Button } from "@/components/ui/button";
import {
  type AdminFilterOption,
  AdminDateFilter,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

export interface AdminOrdersToolbarProps {
  search: string;
  status: string;
  from: string;
  to: string;
  statusOptions: AdminFilterOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  isExporting: boolean;
  onExport: () => void;
}

export function AdminOrdersToolbar({
  search,
  status,
  from,
  to,
  statusOptions,
  onSearchChange,
  onStatusChange,
  onFromChange,
  onToChange,
  isExporting,
  onExport,
}: AdminOrdersToolbarProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="orders-search"
        label="Search"
        placeholder="Order id or email"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="orders-status"
        label="Status"
        anyLabel="Any status"
        options={statusOptions}
        value={status}
        onChange={onStatusChange}
      />
      <AdminDateFilter
        id="orders-from"
        label="From"
        value={from}
        onChange={onFromChange}
      />
      <AdminDateFilter
        id="orders-to"
        label="To"
        value={to}
        onChange={onToChange}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-end"
        disabled={isExporting}
        onClick={onExport}
      >
        {isExporting ? "Preparing…" : "Export CSV"}
      </Button>
    </AdminToolbar>
  );
}
