export interface CareSource {
  care_notes: string[];
}

// One list for the whole parcel: the same line written on two pieces is still one instruction.
export function toCareLines(pieces: CareSource[]): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const piece of pieces) {
    for (const note of piece.care_notes) {
      const line = note.trim();
      const key = line.toLowerCase();
      if (line.length === 0 || seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
    }
  }
  return lines;
}
