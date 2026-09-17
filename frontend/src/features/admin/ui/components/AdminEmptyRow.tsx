export interface AdminEmptyRowProps {
  colSpan: number;
  message: string;
}

export function AdminEmptyRow({ colSpan, message }: AdminEmptyRowProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="border-b border-ash px-3 py-10 text-center text-[13px] text-muted-foreground"
      >
        {message}
      </td>
    </tr>
  );
}
