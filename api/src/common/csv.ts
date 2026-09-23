// RFC 4180 cell: quoted when it holds a comma, quote or newline, quotes doubled.
export function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
