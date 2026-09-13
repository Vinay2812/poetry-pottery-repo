export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Appends -2, -3 … until the slug is free; taken is the set of slugs already in the table.
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base.length > 0 ? base : "piece";
  if (!taken.has(root)) return root;
  let suffix = 2;
  while (taken.has(`${root}-${suffix}`)) suffix += 1;
  return `${root}-${suffix}`;
}
