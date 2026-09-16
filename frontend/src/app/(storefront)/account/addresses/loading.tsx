import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
      <SkeletonHeading hasDescription={false} />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-44 w-full" />
        <SkeletonBlock className="h-44 w-full" />
      </div>
    </PageShell>
  );
}
