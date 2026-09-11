import { Search, X } from "lucide-react";

export interface SearchFieldProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
}

export function SearchField({
  value,
  placeholder,
  onChange,
  onClear,
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search pieces"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-12 w-full rounded-full bg-cream pr-12 pl-12 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-primary-light"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
