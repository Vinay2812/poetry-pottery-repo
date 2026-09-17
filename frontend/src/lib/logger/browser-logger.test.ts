import { afterEach, describe, expect, it, vi } from "vitest";

import { createBrowserLogger } from "./browser-logger";

afterEach(() => {
  vi.restoreAllMocks();
});

function spyOnConsole() {
  return {
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
    debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
  };
}

describe("createBrowserLogger", () => {
  it("writes each level to its own console method with the level in front", () => {
    const spies = spyOnConsole();
    const logger = createBrowserLogger("debug");

    logger.error("checkout failed");
    logger.warn("slot taken");
    logger.info("cart loaded");
    logger.debug("slot grid rebuilt");

    expect(spies.error).toHaveBeenCalledWith("[error] checkout failed");
    expect(spies.warn).toHaveBeenCalledWith("[warn] slot taken");
    expect(spies.info).toHaveBeenCalledWith("[info] cart loaded");
    expect(spies.debug).toHaveBeenCalledWith("[debug] slot grid rebuilt");
  });

  it("passes the meta object along as a second argument", () => {
    const spies = spyOnConsole();

    createBrowserLogger("info").info("cart loaded", { itemCount: 3 });

    expect(spies.info).toHaveBeenCalledWith("[info] cart loaded", {
      itemCount: 3,
    });
  });

  it("stays quiet below the threshold", () => {
    const spies = spyOnConsole();
    const logger = createBrowserLogger("warn");

    logger.debug("slot grid rebuilt");
    logger.info("cart loaded");
    logger.warn("slot taken");
    logger.error("checkout failed");

    expect(spies.debug).not.toHaveBeenCalled();
    expect(spies.info).not.toHaveBeenCalled();
    expect(spies.warn).toHaveBeenCalledOnce();
    expect(spies.error).toHaveBeenCalledOnce();
  });

  it("lets nothing but errors through at the quietest threshold", () => {
    const spies = spyOnConsole();
    const logger = createBrowserLogger("error");

    logger.warn("slot taken", { slot: "15:00" });
    logger.error("checkout failed");

    expect(spies.warn).not.toHaveBeenCalled();
    expect(spies.error).toHaveBeenCalledOnce();
  });
});
