import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventLevel, EventType, EventWhen } from "@/graphql/generated/graphql";
import { cn } from "@/lib/utils";

import { toLevelLabel } from "@/features/events/types";

export interface EventFiltersProps {
  when: EventWhen;
  eventType: EventType | null;
  level: EventLevel | null;
  isLevelShown: boolean;
  onWhenChange: (when: EventWhen) => void;
  onEventTypeChange: (eventType: EventType | null) => void;
  onLevelChange: (level: EventLevel | null) => void;
}

const WHEN_TABS: { value: EventWhen; label: string }[] = [
  { value: EventWhen.Upcoming, label: "Upcoming" },
  { value: EventWhen.Past, label: "Past" },
];

const TYPE_LINKS: { key: string; value: EventType | null; label: string }[] = [
  { key: "all", value: null, label: "All" },
  {
    key: EventType.PotteryWorkshop,
    value: EventType.PotteryWorkshop,
    label: "Workshops",
  },
  { key: EventType.OpenMic, value: EventType.OpenMic, label: "Open mics" },
];

const LEVELS: EventLevel[] = [
  EventLevel.Beginner,
  EventLevel.Intermediate,
  EventLevel.Advanced,
  EventLevel.AllLevels,
];

const ANY_LEVEL = "ANY";

export function EventFilters({
  when,
  eventType,
  level,
  isLevelShown,
  onWhenChange,
  onEventTypeChange,
  onLevelChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-ash pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div
          role="group"
          aria-label="When"
          className="inline-flex border border-ash"
        >
          {WHEN_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={when === tab.value}
              onClick={() => onWhenChange(tab.value)}
              className={cn(
                "px-4 py-2 text-[13px] transition-colors",
                when === tab.value
                  ? "bg-ink text-white"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="Kind of evening"
          className="flex flex-wrap items-center gap-4"
        >
          {TYPE_LINKS.map((link) => (
            <button
              key={link.key}
              type="button"
              aria-pressed={eventType === link.value}
              onClick={() => onEventTypeChange(link.value)}
              className={cn(
                "border-b pb-0.5 text-[13px] transition-colors",
                eventType === link.value
                  ? "border-ink text-ink"
                  : "border-transparent text-muted-foreground hover:border-ink hover:text-ink",
              )}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {isLevelShown && (
        <Select
          value={level ?? ANY_LEVEL}
          onValueChange={(value) =>
            onLevelChange(value === ANY_LEVEL ? null : (value as EventLevel))
          }
        >
          <SelectTrigger aria-label="Level" className="h-10 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_LEVEL}>Any level</SelectItem>
            {LEVELS.map((value) => (
              <SelectItem key={value} value={value}>
                {toLevelLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
