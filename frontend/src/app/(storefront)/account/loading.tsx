import { PageShell } from "@/components/layout/PageShell";
import { SkeletonBlock, SkeletonRows } from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="narrow" className="flex flex-col gap-8 py-8 md:py-12">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-3 w-36" />
        </div>
      </div>
      <SkeletonRows count={6} />
    </PageShell>
  );
}
