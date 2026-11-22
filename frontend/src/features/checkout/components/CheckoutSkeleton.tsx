import { Fragment, type ReactNode } from "react";

import { SkeletonBlock } from "@/components/layout/PageSkeleton";

import { CheckoutLayout } from "@/features/checkout/components/CheckoutLayout";

interface SkeletonSection {
  id: string;
  body: string;
}

// One entry per checkout section, with the height its body usually takes.
const DETAIL_SECTIONS: SkeletonSection[] = [
  { id: "deliver-to", body: "h-36" },
  { id: "pieces", body: "h-40" },
  { id: "gift-and-notes", body: "h-48" },
];

// Mirrors CheckoutSection: a hairline-ruled heading, then the body.
function renderSection(body: string, footer?: ReactNode) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-ash pb-3">
        <SkeletonBlock className="h-5 w-28" />
      </div>
      <SkeletonBlock className={`${body} w-full`} />
      {footer}
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonBlock className="h-9 w-48 md:h-12 md:w-64" />
      <CheckoutLayout
        details={DETAIL_SECTIONS.map((section) => (
          <Fragment key={section.id}>{renderSection(section.body)}</Fragment>
        ))}
        summary={renderSection(
          "h-28",
          <SkeletonBlock className="h-12 w-full" />,
        )}
      />
    </div>
  );
}
