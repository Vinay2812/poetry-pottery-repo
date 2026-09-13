"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  type AdminFilterOption,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

const STATE_OPTIONS: AdminFilterOption[] = [
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

const FEATURED_OPTIONS: AdminFilterOption[] = [
  { value: "1", label: "Featured" },
  { value: "0", label: "Not featured" },
];

export interface PiecesToolbarProps {
  search: string;
  categoryId: string;
  collectionId: string;
  activeState: string;
  featuredState: string;
  isLowStockOnly: boolean;
  categoryOptions: AdminFilterOption[];
  collectionOptions: AdminFilterOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onFeaturedChange: (value: string) => void;
  onLowStockChange: (isLowStockOnly: boolean) => void;
}

export function PiecesToolbar({
  search,
  categoryId,
  collectionId,
  activeState,
  featuredState,
  isLowStockOnly,
  categoryOptions,
  collectionOptions,
  onSearchChange,
  onCategoryChange,
  onCollectionChange,
  onActiveChange,
  onFeaturedChange,
  onLowStockChange,
}: PiecesToolbarProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="pieces-search"
        label="Search"
        placeholder="Name of a piece"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="pieces-category"
        label="Category"
        anyLabel="Any category"
        options={categoryOptions}
        value={categoryId}
        onChange={onCategoryChange}
      />
      <AdminSelectFilter
        id="pieces-collection"
        label="Collection"
        anyLabel="Any collection"
        options={collectionOptions}
        value={collectionId}
        onChange={onCollectionChange}
      />
      <AdminSelectFilter
        id="pieces-state"
        label="State"
        anyLabel="Any state"
        options={STATE_OPTIONS}
        value={activeState}
        onChange={onActiveChange}
      />
      <AdminSelectFilter
        id="pieces-featured"
        label="Featured"
        anyLabel="Any"
        options={FEATURED_OPTIONS}
        value={featuredState}
        onChange={onFeaturedChange}
      />
      <Label
        htmlFor="pieces-low-stock"
        className="flex h-9 items-center gap-2 text-[13px]"
      >
        <Checkbox
          id="pieces-low-stock"
          checked={isLowStockOnly}
          onCheckedChange={(checked) => onLowStockChange(checked === true)}
        />
        Running low only
      </Label>
    </AdminToolbar>
  );
}
