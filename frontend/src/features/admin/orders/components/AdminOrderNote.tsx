"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { AdminField } from "@/features/admin/ui";

export interface AdminOrderNoteProps {
  value: string;
  isDirty: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function AdminOrderNote({
  value,
  isDirty,
  isSaving,
  isSaved,
  onChange,
  onSave,
}: AdminOrderNoteProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="flex flex-col gap-3"
    >
      <AdminField
        id="order-admin-note"
        label="Studio note"
        hint="Only the studio sees this. Empty it to clear it."
        error={undefined}
      >
        <Textarea
          id="order-admin-note"
          rows={3}
          maxLength={1000}
          className="text-[13px]"
          placeholder="Wrap the two mugs separately"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </AdminField>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isSaving || !isDirty}>
          {isSaving ? "Saving…" : "Save note"}
        </Button>
        {isSaved && !isDirty && (
          <span role="status" className="text-[12px] text-muted-foreground">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
