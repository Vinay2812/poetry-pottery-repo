"use client";

import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

// The shared slider ships a sage range and pill ends; the shelf wants an ash rail
// with an ink handle, and the parts are only reachable from the root.
const PRICE_SLIDER_CLASS =
  "[&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-track]]:bg-ash " +
  "[&_[data-slot=slider-range]]:bg-smoke " +
  "[&_[data-slot=slider-thumb]]:rounded-none [&_[data-slot=slider-thumb]]:border-ink " +
  "[&_[data-slot=slider-thumb]]:bg-ink [&_[data-slot=slider-thumb]]:ring-ink/30";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface ProductFiltersProps {
  categoryOptions: FilterOption[];
  selectedCategories: string[];
  collectionOptions: FilterOption[];
  selectedCollection: string | null;
  materialOptions: FilterOption[];
  selectedMaterials: string[];
  glazeOptions: FilterOption[];
  selectedGlazes: string[];
  priceFloor: number;
  priceCeiling: number;
  priceRange: [number, number];
  // Set when the URL holds a price filter, so it stays removable even with no slider to drag.
  chosenPriceLabel: string | null;
  inStockOnly: boolean;
  customizableOnly: boolean;
  secondsOnly: boolean;
  secondsCount: number;
  onToggleCategory: (slug: string) => void;
  onToggleCollection: (slug: string) => void;
  onToggleMaterial: (material: string) => void;
  onToggleGlaze: (slug: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onPriceRangeCommit: (range: [number, number]) => void;
  onClearPrice: () => void;
  onInStockOnlyChange: (value: boolean) => void;
  onCustomizableOnlyChange: (value: boolean) => void;
  onSecondsOnlyChange: (value: boolean) => void;
}

interface CheckGroupProps {
  title: string;
  idPrefix: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

// Below lg the panel lives in the phone sheet, so each row is a label 44px tall: a tap
// anywhere on it reaches the control, which sits inside it.
const ROW_CLASS =
  "flex min-h-11 items-center gap-3 font-normal lg:min-h-0 lg:gap-2.5";

function CheckGroup({
  title,
  idPrefix,
  options,
  selected,
  onToggle,
}: CheckGroupProps) {
  if (options.length === 0) return null;
  return (
    <fieldset className="flex flex-col lg:gap-3">
      <legend className="mb-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase lg:mb-3">
        {title}
      </legend>
      {options.map((option) => {
        const id = `${idPrefix}-${option.value}`;
        return (
          // Every option stays listed; one with nothing behind it just reads quieter.
          <Label
            key={option.value}
            htmlFor={id}
            className={cn(
              ROW_CLASS,
              option.count === 0 && "text-muted-foreground",
            )}
          >
            <Checkbox
              id={id}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <span className="flex flex-1 justify-between gap-3">
              <span>{option.label}</span>
              <span className="text-muted-foreground tnum">{option.count}</span>
            </span>
          </Label>
        );
      })}
    </fieldset>
  );
}

export function ProductFilters({
  categoryOptions,
  selectedCategories,
  collectionOptions,
  selectedCollection,
  materialOptions,
  selectedMaterials,
  glazeOptions,
  selectedGlazes,
  priceFloor,
  priceCeiling,
  priceRange,
  chosenPriceLabel,
  inStockOnly,
  customizableOnly,
  secondsOnly,
  secondsCount,
  onToggleCategory,
  onToggleCollection,
  onToggleMaterial,
  onToggleGlaze,
  onPriceRangeChange,
  onPriceRangeCommit,
  onClearPrice,
  onInStockOnlyChange,
  onCustomizableOnlyChange,
  onSecondsOnlyChange,
}: ProductFiltersProps) {
  const hasPriceRange = priceCeiling > priceFloor;
  // The panel renders twice (sidebar and mobile sheet), so each copy needs its own ids for labels to bind.
  const scope = useId();
  return (
    <div className="flex flex-col gap-8">
      {/* The group titles are h3s; this is the h2 they hang from. */}
      <h2 className="sr-only">Filters</h2>
      <CheckGroup
        title="Category"
        idPrefix={`${scope}-category`}
        options={categoryOptions}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />

      <CheckGroup
        title="Collection"
        idPrefix={`${scope}-collection`}
        options={collectionOptions}
        selected={selectedCollection ? [selectedCollection] : []}
        onToggle={onToggleCollection}
      />

      {!hasPriceRange && chosenPriceLabel && (
        <div className="flex flex-col gap-1 lg:gap-3">
          <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Price
          </h3>
          <p className="flex min-h-11 items-center justify-between gap-3 text-sm lg:min-h-0">
            <span className="tnum">{chosenPriceLabel}</span>
            <button
              type="button"
              onClick={onClearPrice}
              aria-label={`Remove the price filter, ${chosenPriceLabel}`}
              className="text-[13px] underline-offset-4 hover:text-primary hover:underline"
            >
              Remove
            </button>
          </p>
        </div>
      )}

      {hasPriceRange && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Price
          </h3>
          <Slider
            className={PRICE_SLIDER_CLASS}
            min={priceFloor}
            max={priceCeiling}
            step={50}
            value={priceRange}
            onValueChange={(value) =>
              onPriceRangeChange([
                value[0] ?? priceFloor,
                value[1] ?? priceCeiling,
              ])
            }
            onValueCommit={(value) =>
              onPriceRangeCommit([
                value[0] ?? priceFloor,
                value[1] ?? priceCeiling,
              ])
            }
            aria-label="Price range"
          />
          <p className="flex justify-between text-[13px] text-muted-foreground tnum">
            <span>{formatInr(priceRange[0])}</span>
            <span>{formatInr(priceRange[1])}</span>
          </p>
        </div>
      )}

      <CheckGroup
        title="Clay body"
        idPrefix={`${scope}-material`}
        options={materialOptions}
        selected={selectedMaterials}
        onToggle={onToggleMaterial}
      />

      <CheckGroup
        title="Glaze"
        idPrefix={`${scope}-glaze`}
        options={glazeOptions}
        selected={selectedGlazes}
        onToggle={onToggleGlaze}
      />

      <div className="flex flex-col lg:gap-4">
        <Label
          htmlFor={`${scope}-filter-in-stock`}
          className={cn(ROW_CLASS, "justify-between")}
        >
          Ready to ship only
          <Switch
            id={`${scope}-filter-in-stock`}
            checked={inStockOnly}
            onCheckedChange={onInStockOnlyChange}
          />
        </Label>
        {/* Made-to-order pieces stay off the shelf until this is on, so it says what it brings in. */}
        <div className="flex flex-col gap-1 pb-3 lg:pb-0">
          <Label
            htmlFor={`${scope}-filter-custom`}
            className={cn(ROW_CLASS, "justify-between")}
          >
            Made to order only
            <Switch
              id={`${scope}-filter-custom`}
              checked={customizableOnly}
              onCheckedChange={onCustomizableOnlyChange}
              aria-describedby={`${scope}-filter-custom-note`}
            />
          </Label>
          <p
            id={`${scope}-filter-custom-note`}
            className="text-[13px] text-muted-foreground"
          >
            Thrown once you order, ready in about ten days.
          </p>
        </div>
        {/* The seconds shelf is listed on the shelf and in the archive alike, count and all. */}
        <div className="flex flex-col gap-1 pb-3 lg:pb-0">
          <Label
            htmlFor={`${scope}-filter-seconds`}
            className={cn(
              ROW_CLASS,
              "justify-between",
              secondsCount === 0 && "text-muted-foreground",
            )}
          >
            <span>
              Seconds{" "}
              <span className="text-muted-foreground tnum">
                ({secondsCount})
              </span>
            </span>
            <Switch
              id={`${scope}-filter-seconds`}
              checked={secondsOnly}
              onCheckedChange={onSecondsOnlyChange}
              // Spelt out so the count is spoken as "Seconds (0)", not run into the word.
              aria-label={`Seconds (${secondsCount})`}
              aria-describedby={`${scope}-filter-seconds-note`}
            />
          </Label>
          <p
            id={`${scope}-filter-seconds-note`}
            className="text-[13px] text-muted-foreground"
          >
            Pieces the kiln marked, sold at a lower price with the flaw named.
          </p>
        </div>
      </div>
    </div>
  );
}
