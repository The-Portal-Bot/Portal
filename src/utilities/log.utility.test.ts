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

  Deno.test("logger logging methods call console.log", () => {
    const consoleSpy = spy(console, "log");

    logger.error("error");
    logger.warn("warn");
    logger.info("info");
    logger.debug("debug");

    assertEquals(consoleSpy.calls.length, 4);
  });

  Deno.test("logger logging methods call console.error", () => {
    const consoleErrorSpy = spy(console, "error");

    logger.error("error");

    assertEquals(consoleErrorSpy.calls.length, 1);
  });

  Deno.test("logger logging methods call console.warn", () => {
    const consoleWarnSpy = spy(console, "warn");

    logger.warn("warn");

    assertEquals(consoleWarnSpy.calls.length, 1);
  });

  Deno.test("logger logging methods call console.info", () => {
    const consoleInfoSpy = spy(console, "info");

    logger.info("info");

    assertEquals(consoleInfoSpy.calls.length, 1);
  });

  Deno.test("logger logging methods do not call console.log when DEBUG is not set", () => {
    const consoleSpy = spy(console, "log");

    Deno.env.set("DEBUG", "");

    logger.error("error");
    logger.warn("warn");
    logger.info("info");
    logger.debug("debug");

    assertEquals(consoleSpy.calls.length, 0);
  });

  Deno.test("logger logging methods call console.log when DEBUG is set", () => {
    const consoleSpy = spy(console, "log");

    Deno.env.set("DEBUG", "true");

    logger.error("error");
    logger.warn("warn");
    logger.info("info");
    logger.debug("debug");

    assertEquals(consoleSpy.calls.length, 4);
  });
});
