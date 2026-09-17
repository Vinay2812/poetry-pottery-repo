import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonBlock,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
      <SkeletonHeading hasDescription={false} />
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col border-t border-ash">
          <SkeletonBlock className="my-6 h-24 w-full" />
          <SkeletonBlock className="mb-6 h-24 w-full" />
        </div>
        <SkeletonBlock className="h-56 w-full" />
      </div>
    </PageShell>
  );
}
