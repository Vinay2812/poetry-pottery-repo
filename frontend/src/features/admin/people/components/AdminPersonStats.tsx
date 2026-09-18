import { AdminStatTile } from "@/features/admin/ui";

export interface AdminPersonStatsProps {
  orders: string;
  registrations: string;
  bookings: string;
  reviews: string;
  ordersHref: string | null;
  registrationsHref: string | null;
  bookingsHref: string | null;
  reviewsHref: string | null;
}

export function AdminPersonStats({
  orders,
  registrations,
  bookings,
  reviews,
  ordersHref,
  registrationsHref,
  bookingsHref,
  reviewsHref,
}: AdminPersonStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <AdminStatTile
        label="Orders"
        value={orders}
        hint="Placed on the shelf"
        href={ordersHref}
      />
      <AdminStatTile
        label="Registrations"
        value={registrations}
        hint="Seats at events"
        href={registrationsHref}
      />
      <AdminStatTile
        label="Bookings"
        value={bookings}
        hint="Wheel sessions"
        href={bookingsHref}
      />
      <AdminStatTile
        label="Reviews"
        value={reviews}
        hint="Written so far"
        href={reviewsHref}
      />
    </div>
  );
}
