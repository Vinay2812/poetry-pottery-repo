import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonGrid,
  SkeletonHeading,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-6 py-8 md:py-12">
      <SkeletonHeading hasDescription={false} />
      <SkeletonGrid count={4} />
    </PageShell>
  );
}
