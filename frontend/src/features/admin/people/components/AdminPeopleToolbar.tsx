"use client";

import {
  type AdminFilterOption,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

export interface AdminPeopleToolbarProps {
  search: string;
  role: string;
  roleOptions: AdminFilterOption[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function AdminPeopleToolbar({
  search,
  role,
  roleOptions,
  onSearchChange,
  onRoleChange,
}: AdminPeopleToolbarProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="people-search"
        label="Search"
        placeholder="Name, email or phone"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="people-role"
        label="Role"
        anyLabel="Any role"
        options={roleOptions}
        value={role}
        onChange={onRoleChange}
      />
    </AdminToolbar>
  );
}
