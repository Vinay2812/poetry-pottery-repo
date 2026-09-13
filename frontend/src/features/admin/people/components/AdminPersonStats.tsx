import { AdminStatTile } from "@/features/admin/ui";

export interface AdminPersonStatsProps {
  orders: string;
  registrations: string;
  bookings: string;
  reviews: string;
}

export function AdminPersonStats({
  orders,
  registrations,
  bookings,
  reviews,
}: AdminPersonStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <AdminStatTile label="Orders" value={orders} hint="Placed on the shelf" />
      <AdminStatTile
        label="Registrations"
        value={registrations}
        hint="Seats at events"
      />
      <AdminStatTile label="Bookings" value={bookings} hint="Wheel sessions" />
      <AdminStatTile label="Reviews" value={reviews} hint="Written so far" />
    </div>
  );
}
