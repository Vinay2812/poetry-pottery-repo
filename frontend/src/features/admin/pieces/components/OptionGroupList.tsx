"use client";

import { Button } from "@/components/ui/button";

import { AdminStatusPill } from "@/features/admin/ui";

interface OptionRow {
  id: number;
  name: string;
  priceLabel: string;
  sortLabel: string;
  isActive: boolean;
}

export interface OptionGroupRow {
  id: number;
  name: string;
  summary: string;
  priceLabel: string;
  isChoice: boolean;
  lengthLabel: string | null;
  options: OptionRow[];
}

export interface OptionGroupListProps {
  groups: OptionGroupRow[];
  busyId: number | null;
  onEditGroup: (groupId: number) => void;
  onDeleteGroup: (groupId: number) => void;
  onAddOption: (groupId: number) => void;
  onEditOption: (groupId: number, optionId: number) => void;
  onDeleteOption: (groupId: number, optionId: number) => void;
}

export function OptionGroupList({
  groups,
  busyId,
  onEditGroup,
  onDeleteGroup,
  onAddOption,
  onEditOption,
  onDeleteOption,
}: OptionGroupListProps) {
  if (groups.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        No option groups yet. Add one to let a buyer choose.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {groups.map((group) => (
        <li
          key={group.id}
          className="flex flex-col gap-3 border border-ash p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[15px]">{group.name}</span>
              <span className="text-[12px] text-muted-foreground">
                {group.summary}
              </span>
              <span className="text-[12px] text-muted-foreground tnum">
                {group.priceLabel}
                {group.lengthLabel ? ` · ${group.lengthLabel}` : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.isChoice && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === group.id}
                  onClick={() => onAddOption(group.id)}
                >
                  Add option
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === group.id}
                onClick={() => onEditGroup(group.id)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === group.id}
                onClick={() => onDeleteGroup(group.id)}
              >
                Delete
              </Button>
            </div>
          </div>
          {group.isChoice && group.options.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              No options in this group yet.
            </p>
          )}
          {group.options.length > 0 && (
            <ul className="flex flex-col divide-y divide-ash border-t border-ash">
              {group.options.map((option) => (
                <li
                  key={option.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2"
                >
                  <span className="flex items-center gap-2 text-[13px]">
                    {option.name}
                    {!option.isActive && (
                      <AdminStatusPill label="Off" tone="quiet" />
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[12px] text-muted-foreground tnum">
                      {option.priceLabel} · {option.sortLabel}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busyId === group.id}
                      onClick={() => onEditOption(group.id, option.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busyId === group.id}
                      onClick={() => onDeleteOption(group.id, option.id)}
                    >
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
