import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import {
  EventLevel,
  EventStatus,
  EventType,
  RegistrationStatus,
} from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";

registerEnumType(EventType, { name: "EventType" });
registerEnumType(EventStatus, { name: "EventStatus" });
registerEnumType(EventLevel, { name: "EventLevel" });
registerEnumType(RegistrationStatus, { name: "RegistrationStatus" });

export enum EventWhen {
  UPCOMING = "UPCOMING",
  PAST = "PAST",
}

registerEnumType(EventWhen, { name: "EventWhen" });

@ObjectType()
export class Event {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => EventType)
  event_type!: EventType;

  @Field(() => EventStatus)
  status!: EventStatus;

  @Field(() => EventLevel, { nullable: true })
  level!: EventLevel | null;

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

  @Field(() => Int)
  available_seats!: number;

  @Field(() => String, { nullable: true })
  instructor!: string | null;

  @Field()
  image_url!: string;

  @Field(() => [String])
  gallery!: string[];

  @Field(() => [String])
  includes!: string[];

  @Field(() => [String])
  highlights!: string[];

  @Field(() => [String])
  performers!: string[];

  @Field(() => Float)
  rating_avg!: number;

  @Field(() => Int)
  rating_count!: number;

  @Field()
  is_past!: boolean;

  // Resolved per request for the signed-in visitor.
  @Field(() => Registration, { nullable: true })
  my_registration?: Registration | null;
}

@ObjectType()
export class Registration {
  @Field()
  id!: string;

  @Field(() => Event)
  event!: Event;

  @Field(() => Int)
  seats!: number;

  @Field(() => Int)
  unit_price!: number;

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
export class EventsResult {
  @Field(() => [Event])
  items!: Event[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@ObjectType()
export class RegistrationsResult {
  @Field(() => [Registration])
  items!: Registration[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class EventsFilterInput {
  @Field(() => EventWhen, { nullable: true })
  when?: EventWhen | null;

  @Field(() => EventType, { nullable: true })
  event_type?: EventType | null;

  @Field(() => EventLevel, { nullable: true })
  level?: EventLevel | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class RegisterForEventInput {
  @Field(() => Int)
  event_id!: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  seats!: number;

  @Field(() => String, { nullable: true })
  note?: string | null;
}
