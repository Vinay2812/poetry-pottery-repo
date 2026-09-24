import { Test } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";
import { QueueService } from "@/queue/queue.service";
import { MailService, type MailMessage } from "./mail.service";

const { transport } = vi.hoisted(() => ({
  transport: { sendMail: vi.fn<(options: SendMailOptions) => Promise<void>>() },
}));

vi.mock("nodemailer", () => {
  const createTransport = vi.fn(() => transport);
  return { default: { createTransport }, createTransport };
});

vi.mock("@/config/env", async () => {
  const actual =
    await vi.importActual<typeof import("@/config/env")>("@/config/env");
  return {
    ...actual,
    env: actual.buildEnv({
      ...process.env,
      SMTP_HOST: "smtp.studio.test",
      SMTP_PORT: "587",
      SMTP_USER: "studio",
      SMTP_PASSWORD: "kiln-key",
      MAIL_FROM: "Poetry & Pottery <studio@poetry.test>",
    }),
  };
});

const createTransport = vi.mocked(nodemailer.createTransport);

const queueMock = { publish: vi.fn<QueueService["publish"]>() };
const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function message(overrides: Partial<MailMessage> = {}): MailMessage {
  return {
    to: "potter@example.com",
    subject: "Order kiln-7 received",
    html: "<p>Thanks for ordering</p>",
    text: "Thanks for ordering",
    ...overrides,
  };
}

async function createService(): Promise<MailService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      MailService,
      { provide: QueueService, useValue: queueMock },
      { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
    ],
  }).compile();
  return moduleRef.get(MailService);
}

const smtp = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
};

describe("MailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transport.sendMail.mockResolvedValue(undefined);
    queueMock.publish.mockResolvedValue(undefined);
  });

  afterEach(() => {
    env.SMTP_HOST = smtp.host;
    env.SMTP_PORT = smtp.port;
    env.SMTP_USER = smtp.user;
    env.SMTP_PASSWORD = smtp.password;
  });

  it("queues a message rather than holding the request open on SMTP", async () => {
    const service = await createService();
    const payload = message();

    await service.enqueue(payload);

    expect(queueMock.publish).toHaveBeenCalledWith("mail.send", payload);
    expect(transport.sendMail).not.toHaveBeenCalled();
  });

  it("delivers through the transport under the configured from address", async () => {
    const service = await createService();

    await service.deliver(message());

    expect(transport.sendMail).toHaveBeenCalledWith({
      from: "Poetry & Pottery <studio@poetry.test>",
      to: "potter@example.com",
      subject: "Order kiln-7 received",
      html: "<p>Thanks for ordering</p>",
      text: "Thanks for ordering",
    });
    expect(loggerMock.info).toHaveBeenCalledWith("mail sent", {
      subject: "Order kiln-7 received",
    });
    expect(JSON.stringify(loggerMock.info.mock.calls)).not.toContain(
      "potter@example.com",
    );
    expect(queueMock.publish).not.toHaveBeenCalled();
  });

  it("delivers a message that carries no plain-text part", async () => {
    const service = await createService();

    await service.deliver(message({ text: undefined }));

    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ text: undefined }),
    );
  });

  it("lets an SMTP failure escape so the job is dead-lettered, not silently lost", async () => {
    const service = await createService();
    transport.sendMail.mockRejectedValue(new Error("smtp refused"));

    await expect(service.deliver(message())).rejects.toThrow("smtp refused");
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it("logs and skips delivery when no SMTP host is configured", async () => {
    env.SMTP_HOST = undefined;
    const service = await createService();

    await expect(service.deliver(message())).resolves.toBeUndefined();

    expect(createTransport).not.toHaveBeenCalled();
    expect(transport.sendMail).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith(
      "mail skipped (SMTP not configured)",
      { subject: "Order kiln-7 received" },
    );
  });

  it("still queues messages when SMTP is unconfigured, so nothing is dropped at the edge", async () => {
    env.SMTP_HOST = undefined;
    const service = await createService();

    await service.enqueue(message());

    expect(queueMock.publish).toHaveBeenCalledWith("mail.send", message());
  });

  it("authenticates with the configured credentials on the submission port", async () => {
    await createService();

    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.studio.test",
      port: 587,
      secure: false,
      auth: { user: "studio", pass: "kiln-key" },
    });
  });

  it("switches to implicit TLS on port 465", async () => {
    env.SMTP_PORT = 465;

    await createService();

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true }),
    );
  });

  it("connects anonymously when only a host is configured", async () => {
    env.SMTP_USER = undefined;
    env.SMTP_PASSWORD = undefined;

    await createService();

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ auth: undefined }),
    );
  });

  it("connects anonymously when a user has no password", async () => {
    env.SMTP_PASSWORD = undefined;

    await createService();

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ auth: undefined }),
    );
  });
});
