import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  ADMIN_FROM_LAPTOP,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { GlazeSwatch } from "@/features/admin/glazes/components/GlazeSwatch";
import {
  describeGlazeDeleteBlock,
  describePieces,
  type GlazeRow,
} from "@/features/admin/glazes/types";

const COLUMN_COUNT = 6;

export interface GlazesTableProps {
  rows: GlazeRow[];
  isBusy: boolean;
  isEditorOpen: boolean;
  /** null while the editor is a blank new row at the end of the table. */
  editorRowId: number | null;
  editor: ReactNode;
  emptyMessage: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function GlazesTable({
  rows,
  isBusy,
  isEditorOpen,
  editorRowId,
  editor,
  emptyMessage,
  onEdit,
  onDelete,
}: GlazesTableProps) {
  const isNewRowOpen = isEditorOpen && editorRowId === null;

  return (
    <AdminTableFrame caption="Every glaze the studio fires" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Swatch</th>
          <th className={ADMIN_TH}>Name</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Description</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Variation</th>
          <th className={ADMIN_TH}>Pieces</th>
          <th className={ADMIN_TH}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && !isNewRowOpen && (
          <AdminEmptyRow colSpan={COLUMN_COUNT} message={emptyMessage} />
        )}
        {rows.map((row) => {
          const inUseNote = describeGlazeDeleteBlock(row.productCount);
          return isEditorOpen && editorRowId === row.id ? (
            <tr key={row.id}>
              <td colSpan={COLUMN_COUNT} className="border-b border-ash p-3">
                {editor}
              </td>
            </tr>
          ) : (
            <tr key={row.id} className={ADMIN_TR}>
              <td className={ADMIN_TD}>
                <GlazeSwatch
                  swatchUrl={row.swatchUrl}
                  colorCode={row.colorCode}
                  name={row.name}
                />
              </td>
              <td className={ADMIN_TD}>{row.name}</td>
              <td
                className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} max-w-80 text-muted-foreground`}
              >
                {row.description}
              </td>
              <td
                className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} max-w-64 text-muted-foreground`}
              >
                {row.variationNote === "" ? "—" : row.variationNote}
              </td>
              <td
                className={`${ADMIN_TD} whitespace-nowrap text-muted-foreground tnum`}
              >
                {describePieces(row.productCount)}
              </td>
              <td className={ADMIN_TD}>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isEditorOpen}
                    aria-label={`Edit ${row.name}`}
                    onClick={() => onEdit(row.id)}
                  >
                    Edit
                  </Button>
                  {/* Focusable even when in use, so a keyboard reaches the reason; the click does nothing. */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isEditorOpen}
                    aria-disabled={inUseNote !== null}
                    title={inUseNote ?? undefined}
                    className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent"
                    aria-label={`Delete ${row.name}`}
                    aria-describedby={
                      inUseNote ? `glaze-${row.id}-in-use` : undefined
                    }
                    onClick={() => {
                      if (inUseNote === null) onDelete(row.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
                {inUseNote && (
                  <span id={`glaze-${row.id}-in-use`} className="sr-only">
                    {inUseNote}
                  </span>
                )}
                {inUseNote && (
                  <span
                    aria-hidden="true"
                    className="mt-1 block text-center text-[12px] text-muted-foreground md:hidden"
                  >
                    In use
                  </span>
                )}
              </td>
            </tr>
          );
        })}
        {isNewRowOpen && (
          <tr>
            <td colSpan={COLUMN_COUNT} className="border-b border-ash p-3">
              {editor}
            </td>
          </tr>
        )}
      </tbody>
    </AdminTableFrame>
  );
}
