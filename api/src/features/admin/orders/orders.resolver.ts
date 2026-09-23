import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderStatus } from "@prisma/client";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { AdminOrdersService } from "./orders.service";
import {
  AdminOrder,
  AdminOrdersFilterInput,
  AdminOrdersResult,
} from "./orders.type";

@Resolver(() => AdminOrder)
export class AdminOrdersResolver {
  constructor(private readonly orders: AdminOrdersService) {}

  @AdminRequired()
  @Query(() => AdminOrdersResult)
  adminOrders(
    @Args("filter", { type: () => AdminOrdersFilterInput, nullable: true })
    filter: AdminOrdersFilterInput | null,
  ): Promise<AdminOrdersResult> {
    return this.orders.list(filter ?? {});
  }

  @AdminRequired()
  @Query(() => String)
  exportOrders(
    @Args("filter", { type: () => AdminOrdersFilterInput, nullable: true })
    filter: AdminOrdersFilterInput | null,
  ): Promise<string> {
    return this.orders.exportCsv(filter ?? {});
  }

  @AdminRequired()
  @Query(() => AdminOrder)
  adminOrder(@Args("id") id: string): Promise<AdminOrder> {
    return this.orders.byId(id);
  }

  @AdminRequired()
  @Mutation(() => AdminOrder)
  setOrderStatus(
    @Args("id") id: string,
    @Args("status", { type: () => OrderStatus }) status: OrderStatus,
    @Args("tracking_note", { type: () => String, nullable: true })
    trackingNote: string | null,
    @Args("cancel_reason", { type: () => String, nullable: true })
    cancelReason: string | null,
  ): Promise<AdminOrder> {
    return this.orders.setStatus(id, status, {
      ...(trackingNote === null ? {} : { tracking_note: trackingNote }),
      ...(cancelReason === null ? {} : { cancel_reason: cancelReason }),
    });
  }

  @AdminRequired()
  @Mutation(() => AdminOrder)
  markOrderPaid(@Args("id") id: string): Promise<AdminOrder> {
    return this.orders.markPaid(id);
  }

  @AdminRequired()
  @Mutation(() => AdminOrder)
  cancelOrderAsAdmin(
    @Args("id") id: string,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<AdminOrder> {
    return this.orders.cancel(id, reason);
  }

  @AdminRequired()
  @Mutation(() => AdminOrder)
  setOrderAdminNote(
    @Args("id") id: string,
    @Args("note", { type: () => String, nullable: true }) note: string | null,
  ): Promise<AdminOrder> {
    return this.orders.setAdminNote(id, note);
  }
}
