import type { TimelineStage } from "@/lib/timeline";

// Test-only: guards stage copy so a promise never echoes the line just above it.
const PHRASE_WORDS = 3;

function toPhrases(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return new Set(
    words
      .slice(0, Math.max(0, words.length - PHRASE_WORDS + 1))
      .map((_, at) => words.slice(at, at + PHRASE_WORDS).join(" ")),
  );
}

// The current stage's description sits right above the next stage's promise, so the
// promise must add something: any three-word run they share is returned.
export function toRepeatedPhrases(stages: readonly TimelineStage[]): string[] {
  return stages.slice(1).flatMap((stage, at) => {
    const before = toPhrases(stages[at]?.description ?? "");
    return [...toPhrases(stage.upcoming ?? "")].filter((phrase) =>
      before.has(phrase),
    );
  });
}
