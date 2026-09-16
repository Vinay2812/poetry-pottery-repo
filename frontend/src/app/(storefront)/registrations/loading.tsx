import { PageShell } from "@/components/layout/PageShell";
import {
  SkeletonHeading,
  SkeletonRows,
} from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell column="wide" className="flex flex-col gap-8 py-8 md:py-12">
      <SkeletonHeading hasDescription={false} />
      <SkeletonRows count={5} />
    </PageShell>
  );
}
