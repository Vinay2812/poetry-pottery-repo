import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewsContainer } from "@/features/admin/reviews";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function AdminReviewsPage() {
  return (
    <Suspense>
      <ReviewsContainer />
    </Suspense>
  );
}
