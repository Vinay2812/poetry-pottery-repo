import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
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
          <th className={ADMIN_TH}>Description</th>
          <th className={ADMIN_TH}>Variation</th>
          <th className={ADMIN_TH}>Pieces</th>
          <th className={ADMIN_TH}>Actions</th>
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
              <td className={`${ADMIN_TD} max-w-80 text-muted-foreground`}>
                {row.description}
              </td>
              <td className={`${ADMIN_TD} max-w-64 text-muted-foreground`}>
                {row.variationNote === "" ? "—" : row.variationNote}
              </td>
              <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
                {describePieces(row.productCount)}
              </td>
              <td className={ADMIN_TD}>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isEditorOpen}
                    onClick={() => onEdit(row.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isEditorOpen || !canDeleteGlaze(row.productCount)}
                    onClick={() => onDelete(row.id)}
                  >
                    Delete
                  </Button>
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
