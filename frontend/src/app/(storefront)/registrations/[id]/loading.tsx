import { PageShell } from "@/components/layout/PageShell";
import { SkeletonBlock, SkeletonRows } from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="wide" className="flex flex-col gap-8 py-8 md:py-12">
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="h-10 w-80" />
      <SkeletonRows count={4} />
      <SkeletonBlock className="h-40 w-full" />
    </PageShell>
  );
}
