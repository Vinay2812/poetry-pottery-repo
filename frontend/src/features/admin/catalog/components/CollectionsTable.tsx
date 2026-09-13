import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { CatalogThumb } from "@/features/admin/catalog/components/CatalogThumb";
import {
  type CollectionRow,
  describePieces,
  describeWindow,
} from "@/features/admin/catalog/types";

const COLUMN_COUNT = 5;

export interface CollectionsTableProps {
  rows: CollectionRow[];
  isBusy: boolean;
  isEditorOpen: boolean;
  /** null while the editor is a blank new row at the end of the table. */
  editorRowId: number | null;
  editor: ReactNode;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CollectionsTable({
  rows,
  isBusy,
  isEditorOpen,
  editorRowId,
  editor,
  onEdit,
  onDelete,
}: CollectionsTableProps) {
  const isNewRowOpen = isEditorOpen && editorRowId === null;

  return (
    <AdminTableFrame caption="Every collection on the shelf" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Image</th>
          <th className={ADMIN_TH}>Name</th>
          <th className={ADMIN_TH}>Window</th>
          <th className={ADMIN_TH}>Pieces</th>
          <th className={ADMIN_TH}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && !isNewRowOpen && (
          <AdminEmptyRow colSpan={COLUMN_COUNT} message="No collections yet" />
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
                <CatalogThumb url={row.imageUrl} alt={row.name} shape="wide" />
              </td>
              <td className={ADMIN_TD}>
                {row.name}
                {row.description !== "" && (
                  <span className="block max-w-80 truncate text-[11px] text-muted-foreground">
                    {row.description}
                  </span>
                )}
              </td>
              <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
                {describeWindow(row.startsAt, row.endsAt)}
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
                    disabled={isEditorOpen}
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
