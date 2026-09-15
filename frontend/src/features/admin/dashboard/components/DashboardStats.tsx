import { AdminStatTile } from "@/features/admin/ui";

export interface DashboardStatsProps {
  orders: string;
  revenue: string;
  pendingRegistrations: string;
  pendingBookings: string;
  unreadMessages: string;
}

export function DashboardStats({
  orders,
  revenue,
  pendingRegistrations,
  pendingBookings,
  unreadMessages,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <AdminStatTile label="Orders" value={orders} hint="Last 30 days" />
      <AdminStatTile label="Revenue" value={revenue} hint="Last 30 days" />
      <AdminStatTile
        label="Registrations"
        value={pendingRegistrations}
        hint="Waiting on you"
      />
      <AdminStatTile
        label="Bookings"
        value={pendingBookings}
        hint="Waiting on you"
      />
      <AdminStatTile
        label="Messages"
        value={unreadMessages}
        hint="Unread in the inbox"
      />
    </div>
  );
}
