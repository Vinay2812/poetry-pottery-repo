import { Injectable } from "@nestjs/common";

import { jobSchemas } from "@/queue/jobs";
import { SubscribeJob } from "@/queue/subscribe.decorator";
import { NotificationsService } from "./notifications.service";

@Injectable()
export class NotificationsConsumer {
  constructor(private readonly notifications: NotificationsService) {}

  @SubscribeJob("notify.back-in-stock")
  async backInStock(payload: unknown): Promise<void> {
    const { productId } = jobSchemas["notify.back-in-stock"].parse(payload);
    await this.notifications.sendBackInStock(productId);
  }
}
