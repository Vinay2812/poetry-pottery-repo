import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import {
  EventLevel,
  EventStatus,
  EventType,
  RegistrationStatus,
} from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { Event, Registration } from "@/features/events/events.type";
import { AdminUserRef } from "../admin.type";

@ObjectType()
export class AdminEventsResult {
  @Field(() => [Event])
  items!: Event[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@ObjectType()
export class AdminRegistration {
  @Field(() => Registration)
  registration!: Registration;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;

  @Field(() => [RegistrationStatus])
  next_statuses!: RegistrationStatus[];
}

@ObjectType()
export class AdminRegistrationsResult {
  @Field(() => [AdminRegistration])
  items!: AdminRegistration[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminEventsFilterInput {
  @Field(() => EventStatus, { nullable: true })
  status?: EventStatus | null;

  @Field(() => EventType, { nullable: true })
  event_type?: EventType | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminRegistrationsFilterInput {
  @Field(() => Int, { nullable: true })
  event_id?: number | null;

  @Field(() => RegistrationStatus, { nullable: true })
  status?: RegistrationStatus | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminEventInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => EventType, { nullable: true })
  event_type?: EventType | null;

  @Field(() => EventLevel, { nullable: true })
  level?: EventLevel | null;

  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field()
  location!: string;

  @Field()
  address!: string;

  @Field(() => Int)
  price!: number;

  @Field(() => Int)
  total_seats!: number;

  @Field(() => String, { nullable: true })
  instructor?: string | null;

  @Field()
  image_url!: string;

  @Field(() => [String], { nullable: true })
  gallery?: string[] | null;

  @Field(() => [String], { nullable: true })
  includes?: string[] | null;

  @Field(() => [String], { nullable: true })
  highlights?: string[] | null;

  @Field(() => [String], { nullable: true })
  performers?: string[] | null;
}
