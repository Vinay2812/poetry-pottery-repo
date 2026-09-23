import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { RegistrationStatus } from "@prisma/client";

import { DayClosedKind } from "./schedule";

registerEnumType(DayClosedKind, { name: "DayClosedKind" });

import { PageInfo } from "@/common/pagination/pagination";

@ObjectType()
export class WorkshopTier {
  // The console needs this to delete a tier; saveWorkshopTier upserts by hours.
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  hours!: number;

  @Field(() => Int)
  price_per_person!: number;

  @Field(() => Int)
  pieces_per_person!: number;
}

@ObjectType()
export class WorkshopConfig {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  image_url!: string | null;

  @Field()
  is_active!: boolean;

  @Field()
  timezone!: string;

  @Field(() => Int)
  opening_minutes!: number;

  @Field(() => Int)
  closing_minutes!: number;

  @Field(() => Int)
  slot_minutes!: number;

  @Field(() => Int)
  capacity_per_slot!: number;

  @Field(() => Int)
  booking_window_days!: number;

  @Field(() => Int)
  slot_span_days!: number;

  @Field(() => [Int])
  closed_weekdays!: number[];

  @Field(() => [WorkshopTier])
  tiers!: WorkshopTier[];
}

@ObjectType()
export class WorkshopSlot {
  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field(() => Int)
  remaining!: number;

  @Field()
  is_available!: boolean;

  @Field(() => String, { nullable: true })
  reason!: string | null;
}

@ObjectType()
export class WorkshopDay {
  @Field()
  date!: string;

  @Field(() => Int)
  weekday!: number;

  @Field()
  is_closed!: boolean;

  @Field(() => DayClosedKind, { nullable: true })
  closed_kind!: DayClosedKind | null;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => [WorkshopSlot])
  slots!: WorkshopSlot[];
}

@ObjectType()
export class WorkshopBookingSlot {
  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;
}

@ObjectType()
export class WorkshopBooking {
  @Field()
  id!: string;

  @Field(() => WorkshopConfig)
  config!: WorkshopConfig;

  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field(() => [WorkshopBookingSlot])
  slots!: WorkshopBookingSlot[];

  @Field(() => Int)
  hours!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => Int)
  price_per_person!: number;

  @Field(() => Int)
  pieces_per_person!: number;

  @Field(() => Int)
  subtotal!: number;

  @Field(() => Int)
  discount!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => RegistrationStatus)
  status!: RegistrationStatus;

  @Field(() => String, { nullable: true })
  note!: string | null;

  @Field(() => String, { nullable: true })
  cancel_reason!: string | null;

  @Field()
  can_cancel!: boolean;

  @Field()
  can_reschedule!: boolean;

  @Field()
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  approved_at!: Date | null;

  @Field(() => Date, { nullable: true })
  confirmed_at!: Date | null;

  @Field(() => Date, { nullable: true })
  rejected_at!: Date | null;

  @Field(() => Date, { nullable: true })
  cancelled_at!: Date | null;
}

@ObjectType()
export class WorkshopBookingsResult {
  @Field(() => [WorkshopBooking])
  items!: WorkshopBooking[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class WorkshopAvailabilityInput {
  @Field()
  config_slug!: string;

  @Field()
  from!: string;

  @Field(() => Int, { nullable: true, defaultValue: 14 })
  days!: number;
}

@InputType()
export class BookWorkshopInput {
  @Field()
  config_slug!: string;

  @Field(() => [Date])
  slot_starts!: Date[];

  @Field(() => Int)
  hours!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => String, { nullable: true })
  note?: string | null;
}

@InputType()
export class RescheduleWorkshopInput {
  @Field()
  booking_id!: string;

  @Field(() => [Date])
  slot_starts!: Date[];
}
