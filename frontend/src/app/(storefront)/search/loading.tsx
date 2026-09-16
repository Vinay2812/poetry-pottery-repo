import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonGrid,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-6 py-8 md:py-12">
      <SkeletonHeading />
      <div className="flex gap-10">
        <div className="hidden w-56 shrink-0 flex-col gap-6 lg:flex">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-28 w-full" />
        </div>
        <div className="flex-1">
          <SkeletonGrid count={8} />
        </div>
      </div>
    </PageShell>
  );
}
