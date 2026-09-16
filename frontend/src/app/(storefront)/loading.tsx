import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-10 py-8 md:py-12">
      <SkeletonHeading />
      <div className="flex flex-col gap-4 border-t border-ash pt-8">
        <SkeletonBlock className="h-3.5 w-full max-w-2xl" />
        <SkeletonBlock className="h-3.5 w-full max-w-xl" />
        <SkeletonBlock className="h-3.5 w-3/4 max-w-lg" />
      </div>
    </PageShell>
  );
}
