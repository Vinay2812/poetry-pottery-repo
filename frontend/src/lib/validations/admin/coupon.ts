import { z } from "zod";

import { CouponKind } from "@/graphql/generated/graphql";

const COUPON_CODE_MIN = 3;
export const COUPON_CODE_MAX = 24;

function wholeNumber(label: string) {
  return z.string().trim().regex(/^\d+$/, `${label} must be a whole number`);
}

// The numbers stay text here; the container turns them into integer rupees and counts.
export const adminCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(
        COUPON_CODE_MIN,
        `Code must be at least ${COUPON_CODE_MIN} characters`,
      )
      .max(
        COUPON_CODE_MAX,
        `Code must be ${COUPON_CODE_MAX} characters or fewer`,
      )
      .regex(/^[A-Z0-9-]+$/, "Code can only use letters, digits and dashes"),
    kind: z.enum(CouponKind),
    value: wholeNumber("Value"),
    min_order: wholeNumber("Minimum order"),
    max_uses: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d+$/.test(value),
        "Maximum uses must be a whole number",
      ),
    starts_at: z.string().trim(),
    expires_at: z.string().trim(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const value = Number(values.value);
    if (values.kind === CouponKind.Percent && (value < 1 || value > 100)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "A percentage has to be between 1 and 100",
      });
    }
    if (values.kind === CouponKind.Fixed && value < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "A flat discount has to be at least 1 rupee",
      });
    }
    if (values.starts_at !== "" && values.expires_at !== "") {
      if (values.expires_at <= values.starts_at) {
        ctx.addIssue({
          code: "custom",
          path: ["expires_at"],
          message: "The expiry has to come after the start",
        });
      }
    }
  });

export type AdminCouponFormValues = z.infer<typeof adminCouponSchema>;
