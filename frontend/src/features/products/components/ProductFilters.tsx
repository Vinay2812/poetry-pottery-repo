import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  priceFloor: number;
  priceCeiling: number;
  priceRange: [number, number];
  inStockOnly: boolean;
  customizableOnly: boolean;
  hasActiveFilters: boolean;
  onToggleCategory: (slug: string) => void;
  onToggleCollection: (slug: string) => void;
  onToggleMaterial: (material: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onPriceRangeCommit: (range: [number, number]) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onCustomizableOnlyChange: (value: boolean) => void;
  onClear: () => void;
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
  priceFloor,
  priceCeiling,
  priceRange,
  inStockOnly,
  customizableOnly,
  hasActiveFilters,
  onToggleCategory,
  onToggleCollection,
  onToggleMaterial,
  onPriceRangeChange,
  onPriceRangeCommit,
  onInStockOnlyChange,
  onCustomizableOnlyChange,
  onClear,
}: ProductFiltersProps) {
  const hasPriceRange = priceCeiling > priceFloor;
  return (
    <div className="flex flex-col gap-8">
      {/* Always in the layout so the first tick never pushes the groups down. */}
      <button
        type="button"
        onClick={onClear}
        inert={!hasActiveFilters}
        className={cn(
          "self-start text-sm underline-offset-4 hover:text-primary hover:underline",
          !hasActiveFilters && "invisible",
        )}
      >
        Clear all
      </button>

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
      </div>
    </div>
  );
}
