import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="narrow" className="flex flex-col gap-6 py-8 md:py-12">
      <SkeletonHeading />
      <div className="flex flex-col gap-4">
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    </PageShell>
  );
}
