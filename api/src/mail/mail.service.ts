import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import nodemailer, { type Transporter } from "nodemailer";
import type { Logger } from "winston";

import { env } from "@/config/env";
import { QueueService } from "@/queue/queue.service";
import type { JobPayload } from "@/queue/jobs";

export type MailMessage = JobPayload<"mail.send">;

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;

  constructor(
    private readonly queue: QueueService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.transporter = env.SMTP_HOST
      ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth:
            env.SMTP_USER && env.SMTP_PASSWORD
              ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
              : undefined,
        })
      : null;
  }

  // Request handlers enqueue; the consumer delivers, so SMTP latency never blocks a mutation.
  enqueue(message: MailMessage): Promise<void> {
    return this.queue.publish("mail.send", message);
  }

  async deliver(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.info("mail skipped (SMTP not configured)", {
        to: message.to,
        subject: message.subject,
      });
      return;
    }
    await this.transporter.sendMail({
      from: env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    this.logger.info("mail sent", { to: message.to, subject: message.subject });
  }
}
