import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatInr } from "@/lib/format";

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

function CheckGroup({
  title,
  idPrefix,
  options,
  selected,
  onToggle,
}: CheckGroupProps) {
  if (options.length === 0) return null;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </legend>
      {options.map((option) => {
        const id = `${idPrefix}-${option.value}`;
        return (
          <div key={option.value} className="flex items-center gap-2.5">
            <Checkbox
              id={id}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={id}
              className="flex flex-1 justify-between font-normal"
            >
              <span>{option.label}</span>
              <span className="text-muted-foreground tnum">{option.count}</span>
            </Label>
          </div>
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
  onInStockOnlyChange,
  onCustomizableOnlyChange,
  onSecondsOnlyChange,
}: ProductFiltersProps) {
  const hasPriceRange = priceCeiling > priceFloor;
  return (
    <div className="flex flex-col gap-8">
      <CheckGroup
        title="Category"
        idPrefix="category"
        options={categoryOptions}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />

      <CheckGroup
        title="Collection"
        idPrefix="collection"
        options={collectionOptions}
        selected={selectedCollection ? [selectedCollection] : []}
        onToggle={onToggleCollection}
      />

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
        idPrefix="material"
        options={materialOptions}
        selected={selectedMaterials}
        onToggle={onToggleMaterial}
      />

      <CheckGroup
        title="Glaze"
        idPrefix="glaze"
        options={glazeOptions}
        selected={selectedGlazes}
        onToggle={onToggleGlaze}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="filter-in-stock" className="font-normal">
            Ready to ship only
          </Label>
          <Switch
            id="filter-in-stock"
            checked={inStockOnly}
            onCheckedChange={onInStockOnlyChange}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="filter-custom" className="font-normal">
            Made to order
          </Label>
          <Switch
            id="filter-custom"
            checked={customizableOnly}
            onCheckedChange={onCustomizableOnlyChange}
          />
        </div>
        {/* The seconds shelf is listed on the shelf and in the archive alike, count and all. */}
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="filter-seconds" className="font-normal">
            Seconds{" "}
            <span className="text-muted-foreground tnum">({secondsCount})</span>
          </Label>
          <Switch
            id="filter-seconds"
            checked={secondsOnly}
            onCheckedChange={onSecondsOnlyChange}
          />
        </div>
        <p className="text-[13px] text-muted-foreground">
          Pieces the kiln marked, sold at a lower price with the flaw named.
        </p>
      </div>
    </div>
  );
}
