import { z } from "zod";

export const STUDIO_NOTE_MAX = 1000;

// A note from the studio goes straight out as mail, so it has to say something.
export const studioNoteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(3, "Write something for the customer")
    .max(STUDIO_NOTE_MAX, `Keep it to ${STUDIO_NOTE_MAX} characters or fewer`),
});

export type StudioNoteFormValues = z.infer<typeof studioNoteSchema>;
