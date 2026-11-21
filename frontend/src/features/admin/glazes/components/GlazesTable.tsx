import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  ADMIN_WIDE_ONLY,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { GlazeSwatch } from "@/features/admin/glazes/components/GlazeSwatch";
import {
  canDeleteGlaze,
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
          <th className={`${ADMIN_TH} ${ADMIN_WIDE_ONLY}`}>Description</th>
          <th className={`${ADMIN_TH} ${ADMIN_WIDE_ONLY}`}>Variation</th>
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
        {rows.map((row) =>
          isEditorOpen && editorRowId === row.id ? (
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
                className={`${ADMIN_TD} ${ADMIN_WIDE_ONLY} max-w-80 text-muted-foreground`}
              >
                {row.description}
              </td>
              <td
                className={`${ADMIN_TD} ${ADMIN_WIDE_ONLY} max-w-64 text-muted-foreground`}
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
                  {/* A glaze still on pieces cannot go; saying so beats a dead button. */}
                  {canDeleteGlaze(row.productCount) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isEditorOpen}
                      aria-label={`Delete ${row.name}`}
                      onClick={() => onDelete(row.id)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <span className="flex h-9 items-center px-4 text-[13px] whitespace-nowrap text-muted-foreground">
                      In use
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ),
        )}
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
