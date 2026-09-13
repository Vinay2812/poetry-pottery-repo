import { Minus, Plus } from "lucide-react";

export interface ParticipantsStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const STEPPER_BUTTON =
  "flex size-11 items-center justify-center transition-colors hover:text-primary disabled:opacity-40";

export function ParticipantsStepper({
  value,
  max,
  onChange,
}: ParticipantsStepperProps) {
  return (
    <div
      role="group"
      aria-label="People"
      className="inline-flex items-center border border-ash"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Fewer people"
        className={STEPPER_BUTTON}
      >
        <Minus className="size-4" strokeWidth={1.5} />
      </button>
      <span className="min-w-6 text-center text-sm tnum" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="More people"
        className={STEPPER_BUTTON}
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
