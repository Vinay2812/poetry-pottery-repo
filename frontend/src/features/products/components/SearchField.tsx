import { Search, X } from "lucide-react";

export interface SearchFieldProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onBlur?: () => void;
  // Lets the page hand focus back to the field, such as after clearing from the empty state.
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
}

export function SearchField({
  value,
  placeholder,
  onChange,
  onClear,
  onBlur,
  inputRef,
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.5}
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label="Search pieces"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-11 w-full border border-ash bg-transparent pr-10 pl-9 text-[15px] placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          // Keeps focus in the field, so clearing never blurs it and sends the draft first.
          onMouseDown={(event) => event.preventDefault()}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center ghost-hover hover:text-primary"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
