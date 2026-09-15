import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatInr } from "@/lib/format";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface ProductFiltersProps {
  categoryOptions: FilterOption[];
  selectedCategories: string[];
  materialOptions: FilterOption[];
  selectedMaterials: string[];
  priceFloor: number;
  priceCeiling: number;
  priceRange: [number, number];
  inStockOnly: boolean;
  customizableOnly: boolean;
  hasActiveFilters: boolean;
  onToggleCategory: (slug: string) => void;
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
      <legend className="mb-3 text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
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
              <span className="text-muted-foreground">{option.count}</span>
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
  materialOptions,
  selectedMaterials,
  priceFloor,
  priceCeiling,
  priceRange,
  inStockOnly,
  customizableOnly,
  hasActiveFilters,
  onToggleCategory,
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
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Clear all filters
        </button>
      )}

      <CheckGroup
        title="Category"
        idPrefix="category"
        options={categoryOptions}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />

      {hasPriceRange && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
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
          <p className="flex justify-between text-sm text-muted-foreground">
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
