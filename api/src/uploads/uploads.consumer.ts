import { Injectable } from "@nestjs/common";

import { jobSchemas } from "@/queue/jobs";
import { SubscribeJob } from "@/queue/subscribe.decorator";
import { UploadsService } from "./uploads.service";

@Injectable()
export class UploadsConsumer {
  constructor(private readonly uploads: UploadsService) {}

  @SubscribeJob("upload.expire")
  async handle(payload: unknown): Promise<void> {
    const { key } = jobSchemas["upload.expire"].parse(payload);
    await this.uploads.expire(key);
  }
}
