export interface MakingStep {
  id: string;
  title: string;
  body: string;
  value: string;
  drawing: string;
}

/** Five making steps, each carrying one studio value, then the closing frame. */
export const MAKING_STEPS: MakingStep[] = [
  {
    id: "wedging",
    title: "Nothing is thrown on day one.",
    body: "The clay is folded until the air is out of it. You cannot hurry this part, and it decides everything after.",
    value: "Trust the process",
    drawing: "A wedge of clay on the bench, spiral ridges across it.",
  },
  {
    id: "throwing",
    title: "Two hands, one revolution at a time.",
    body: "Every wall is pulled by hand, so no two jars close at quite the same height.",
    value: "Handmade with heart",
    drawing: "The jar risen on the wheel, four throwing rings on the wall.",
  },
  {
    id: "trimming",
    title: "Every curl goes back in the bucket.",
    body: "Trimmings are wedged into the next batch. A studio this size throws almost nothing away.",
    value: "Sustainability",
    drawing: "A foot ring cut at the base, trimming curls on the bench.",
  },
  {
    id: "bisque",
    title: "Then we close the door.",
    body: "Once the kiln is loaded, nothing more can be decided. What comes out is what the fire made.",
    value: "The beauty of letting go",
    drawing: "The bisque-fired jar alone on the shelf line, its line warmed.",
  },
  {
    id: "glazing",
    title: "Glaze day is the loud day.",
    body: "Everyone dips on the same afternoon, out of the same buckets, and we all find out together.",
    value: "Community",
    drawing: "A sage glaze band across the shoulder with one drip.",
  },
  {
    id: "fired",
    title: "1225°C. One kiln.",
    body: "",
    value: "",
    drawing:
      "The finished moon jar, glaze set, a kiln mark burning at the foot.",
  },
];

export const MAKING_STEP_COUNT = MAKING_STEPS.length;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** How far the band has been scrolled through, 0 at the first step, 1 at the last. */
export function toStoryProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const travel = rectHeight - viewportHeight;
  if (travel <= 0) return 0;
  return clamp(-rectTop / travel, 0, 1);
}

export function toStepIndex(progress: number): number {
  const raw = Math.floor(clamp(progress, 0, 1) * MAKING_STEP_COUNT);
  return clamp(raw, 0, MAKING_STEP_COUNT - 1);
}

/** Scroll position that parks the band on one step. */
export function toStepScrollTop(
  wrapperTop: number,
  index: number,
  viewportHeight: number,
): number {
  return wrapperTop + clamp(index, 0, MAKING_STEP_COUNT - 1) * viewportHeight;
}

/** Left and right move between steps; every other key is left to the browser. */
export function toArrowStep(key: string, index: number): number {
  if (key === "ArrowLeft") return clamp(index - 1, 0, MAKING_STEP_COUNT - 1);
  if (key === "ArrowRight") return clamp(index + 1, 0, MAKING_STEP_COUNT - 1);
  return index;
}

export function toStepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
