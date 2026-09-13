import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkshopsContainer } from "@/features/admin/workshops";

export const metadata: Metadata = {
  title: "Workshops",
};

export default function AdminWorkshopsPage() {
  return (
    <Suspense>
      <WorkshopsContainer />
    </Suspense>
  );
}
