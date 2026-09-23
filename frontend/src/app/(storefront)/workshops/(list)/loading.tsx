import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-16 py-8 md:py-12">
      <SkeletonHeading hasEyebrow />
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <SkeletonBlock className="h-80 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    </PageShell>
  );
}
