export const VIEWPORT_OPTIONS = {
  mobile: { name: "Mobile", styles: { width: "375px", height: "667px" } },
  tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
  laptop: { name: "Laptop", styles: { width: "1366px", height: "768px" } },
} as const;

export type ViewportKey = keyof typeof VIEWPORT_OPTIONS;

/** Story globals that pin a story to one of the three project breakpoints. */
export function atViewport(value: ViewportKey) {
  return { globals: { viewport: { value, isRotated: false } } };
}
