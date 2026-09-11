import { Injectable } from "@nestjs/common";

import { jobSchemas } from "@/queue/jobs";
import { SubscribeJob } from "@/queue/subscribe.decorator";
import { SearchService } from "./search.service";

@Injectable()
export class SearchConsumer {
  constructor(private readonly search: SearchService) {}

  @SubscribeJob("search.index-product")
  async indexProduct(payload: unknown): Promise<void> {
    const { productId } = jobSchemas["search.index-product"].parse(payload);
    await this.search.indexProduct(productId);
  }

  @SubscribeJob("search.index-event")
  async indexEvent(payload: unknown): Promise<void> {
    const { eventId } = jobSchemas["search.index-event"].parse(payload);
    await this.search.indexEvent(eventId);
  }
}
