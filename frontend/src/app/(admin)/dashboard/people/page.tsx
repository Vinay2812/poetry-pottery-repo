import type { Metadata } from "next";

import { AdminPeopleContainer } from "@/features/admin/people";

export const metadata: Metadata = {
  title: "People",
};

export default function AdminPeoplePage() {
  return <AdminPeopleContainer />;
}
