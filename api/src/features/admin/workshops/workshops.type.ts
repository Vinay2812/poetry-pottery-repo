import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { RegistrationStatus } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { WorkshopBooking } from "@/features/workshops/workshops.type";
import { AdminUserRef } from "../admin.type";

@ObjectType()
export class AdminWorkshopBlackout {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  config_id!: number;

  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field(() => String, { nullable: true })
  reason!: string | null;
}

@ObjectType()
export class AdminWorkshopBooking {
  @Field(() => WorkshopBooking)
  booking!: WorkshopBooking;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;

  @Field(() => [RegistrationStatus])
  next_statuses!: RegistrationStatus[];
}

@ObjectType()
export class AdminWorkshopBookingsResult {
  @Field(() => [AdminWorkshopBooking])
  items!: AdminWorkshopBooking[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminWorkshopBookingsFilterInput {
  @Field(() => Int, { nullable: true })
  config_id?: number | null;

  @Field(() => RegistrationStatus, { nullable: true })
  status?: RegistrationStatus | null;

  @Field(() => Date, { nullable: true })
  from?: Date | null;

  @Field(() => Date, { nullable: true })
  to?: Date | null;

  @Field(() => Int, { nullable: true })
  user_id?: number | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminWorkshopConfigInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  image_url?: string | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;

  @Field(() => String, { nullable: true })
  timezone?: string | null;

  // Minutes past midnight in the studio timezone.
  @Field(() => Int, { nullable: true })
  opening_minutes?: number | null;

  @Field(() => Int, { nullable: true })
  closing_minutes?: number | null;

  @Field(() => Int, { nullable: true })
  slot_minutes?: number | null;

  @Field(() => Int, { nullable: true })
  capacity_per_slot?: number | null;

  @Field(() => Int, { nullable: true })
  booking_window_days?: number | null;

  @Field(() => Int, { nullable: true })
  slot_span_days?: number | null;

  // 0 is Sunday, matching Date.getUTCDay in the scheduler.
  @Field(() => [Int], { nullable: true })
  closed_weekdays?: number[] | null;
}

@InputType()
export class AdminWorkshopTierInput {
  @Field(() => Int)
  hours!: number;

  @Field(() => Int)
  price_per_person!: number;

  @Field(() => Int)
  pieces_per_person!: number;
}

@InputType()
export class AdminWorkshopBlackoutInput {
  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field(() => String, { nullable: true })
  reason?: string | null;
}
