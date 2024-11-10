import { assertEquals, assertExists } from "jsr:@std/assert";
import { spy } from "jsr:@std/testing/mock";
import logger from "./log.utility.ts";

Deno.test("log.utility", () => {
  Deno.test("logger initialization", () => {
    assertExists(logger);
  });

  Deno.test("logger has correct default metadata", () => {
    assertEquals(logger.defaultMeta, { service: "portal" });
  });

  Deno.test("logger logging methods exist", () => {
    assertExists(logger.error);
    assertExists(logger.warn);
    assertExists(logger.info);
    assertExists(logger.debug);
  });

  Deno.test("logger formats messages correctly", async () => {
    const infoSpy = spy(logger, "info");
    await logger.info("test message");

    assertEquals(infoSpy.calls.length, 1);
    assertEquals(infoSpy.calls[0].args[0], "test message");

    infoSpy.restore();
  });

  Deno.test("logger respects DEBUG environment variable", () => {
    const transports = logger.transports;
    const hasConsoleTransport = transports.some((t) => t.name === "console");

    if (Deno.env.get("DEBUG")) {
      assertEquals(hasConsoleTransport, true);
    } else {
      assertEquals(hasConsoleTransport, false);
    }
  });
});
