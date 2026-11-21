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
        label="Events"
        value={registrations}
        hint="Times they asked for a seat"
        href={registrationsHref}
      />
      <AdminStatTile
        label="Wheel sessions"
        value={bookings}
        hint="Times they booked the wheel"
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
