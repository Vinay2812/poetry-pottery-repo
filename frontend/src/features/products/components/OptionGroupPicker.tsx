import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

const KEY_STEPS: Record<string, number | undefined> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

interface OptionChoice {
  id: number;
  name: string;
  priceModifier: number;
}

export interface OptionGroupPickerProps {
  groupId: number;
  name: string;
  kind: "CHOICE" | "TEXT";
  isRequired: boolean;
  priceModifier: number;
  maxLength: number | null;
  choices: OptionChoice[];
  selectedOptionId: number | null;
  text: string;
  error: string | null;
  onSelectOption: (optionId: number) => void;
  onTextChange: (text: string) => void;
}

export function OptionGroupPicker({
  groupId,
  name,
  kind,
  isRequired,
  priceModifier,
  maxLength,
  choices,
  selectedOptionId,
  text,
  error,
  onSelectOption,
  onTextChange,
}: OptionGroupPickerProps) {
  const inputId = `option-${groupId}`;
  const errorId = `${inputId}-error`;
  const labelId = `${inputId}-label`;

  if (kind === "TEXT") {
    return (
      <div className="flex flex-col gap-2">
        <Label
          htmlFor={inputId}
          className="flex items-baseline justify-between"
        >
          <span>
            {name}
            {!isRequired && (
              <span className="text-muted-foreground"> (optional)</span>
            )}
          </span>
          {priceModifier > 0 && (
            <span className="text-xs text-muted-foreground">
              +{formatInr(priceModifier)}
            </span>
          )}
        </Label>
        <Input
          id={inputId}
          value={text}
          maxLength={maxLength ?? undefined}
          onChange={(event) => onTextChange(event.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          placeholder="Type it as you want it carved"
          className="h-11"
        />
        <div className="flex justify-between text-xs">
          {error ? (
            <span id={errorId} className="text-destructive">
              {error}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Letters, numbers and spaces
            </span>
          )}
          {maxLength !== null && (
            <span className="text-muted-foreground">
              {text.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }

  const selectedIndex = choices.findIndex(
    (choice) => choice.id === selectedOptionId,
  );
  // A radio group answers to the arrow keys and holds one tab stop, not one per option.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    if (!step || choices.length === 0) return;
    event.preventDefault();
    const from = selectedIndex === -1 ? 0 : selectedIndex;
    const next = (from + step + choices.length) % choices.length;
    const choice = choices[next];
    if (!choice) return;
    onSelectOption(choice.id);
    const buttons = event.currentTarget.querySelectorAll("button");
    buttons[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        id={labelId}
        className="mb-2 flex w-full items-baseline justify-between text-sm font-medium"
      >
        <span>
          {name}
          {!isRequired && (
            <span className="font-normal text-muted-foreground">
              {" "}
              (optional)
            </span>
          )}
        </span>
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-2"
      >
        {choices.map((choice, index) => {
          const isSelected = choice.id === selectedOptionId;
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={
                isSelected || (selectedIndex === -1 && index === 0) ? 0 : -1
              }
              onClick={() => onSelectOption(choice.id)}
              className={cn(
                "flex h-10 items-center gap-1.5 border px-4 text-sm transition-colors",
                isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-ash bg-transparent hover:border-ink",
              )}
            >
              {choice.name}
              {choice.priceModifier > 0 && (
                <span
                  className={cn(
                    "text-xs",
                    isSelected ? "text-white/75" : "text-muted-foreground",
                  )}
                >
                  +{formatInr(choice.priceModifier)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
