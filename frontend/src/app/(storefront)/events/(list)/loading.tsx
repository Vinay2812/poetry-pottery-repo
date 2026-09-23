import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
  SkeletonRows,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-8 py-8 md:py-12">
      <SkeletonHeading />
      <SkeletonBlock className="h-3.5 w-64" />
      <SkeletonRows count={4} />
    </PageShell>
  );
}
