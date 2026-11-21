import Link from "next/link";

// Sits where upcoming sessions would be, so a list of old ones still leads back to the wheel.
export function NoUpcomingBookings() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        Upcoming
      </h2>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y border-ash py-4">
        <p className="text-[15px] text-muted-foreground">
          Nothing booked at the wheel just now.
        </p>
        <Link
          href="/workshops"
          className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Book a wheel session
        </Link>
      </div>
    </section>
  );
}
