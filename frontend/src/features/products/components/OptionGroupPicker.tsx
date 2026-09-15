import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

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
          className="h-11 rounded-xl"
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

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex w-full items-baseline justify-between text-sm font-medium">
        <span>
          {name}
          {!isRequired && (
            <span className="font-normal text-muted-foreground">
              {" "}
              (optional)
            </span>
          )}
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const isSelected = choice.id === selectedOptionId;
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectOption(choice.id)}
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {choice.name}
              {choice.priceModifier > 0 && (
                <span
                  className={cn(
                    "text-xs",
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  +{formatInr(choice.priceModifier)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </fieldset>
  );
}
