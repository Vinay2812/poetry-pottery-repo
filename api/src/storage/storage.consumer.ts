import { Injectable } from "@nestjs/common";

import { jobSchemas } from "@/queue/jobs";
import { SubscribeJob } from "@/queue/subscribe.decorator";
import { StorageService } from "./storage.service";

@Injectable()
export class StorageConsumer {
  constructor(private readonly storage: StorageService) {}

  @SubscribeJob("storage.delete-object")
  async handle(payload: unknown): Promise<void> {
    const { key } = jobSchemas["storage.delete-object"].parse(payload);
    await this.storage.deleteObject(key);
  }
}
