import { PageShell } from "@/components/layout/PageShell";
import { SkeletonBlock, SkeletonRows } from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-10 py-8 md:py-12">
      <SkeletonBlock className="h-12 w-3/4 max-w-xl" />
      <SkeletonRows count={4} />
      <SkeletonBlock className="h-64 w-full" />
    </PageShell>
  );
}
