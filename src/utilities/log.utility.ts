import "@std/dotenv/load";
import { createLogger, format, transports } from "npm:winston";

class LoggerUtility {
  private static readonly consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "DD-MM-YY HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, service }) =>
      `${timestamp} service: ${service} ${level}: ${message}`
    ),
  );

  private static readonly fileFormat = format.combine(
    format.timestamp({ format: "DD-MM-YY HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, service }) =>
      `${timestamp} service: ${service} ${level}: ${message}`
    ),
    format.json(),
  );

  private static readonly fileTransports = [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: LoggerUtility.fileFormat,
      silent: true,
    }),
    new transports.File({
      filename: "combined.log",
      format: LoggerUtility.fileFormat,
      silent: true,
    }),
  ];

  private static readonly consoleTransport = Deno.env.get("DEBUG")
    ? [new transports.Console({ format: LoggerUtility.consoleFormat })]
    : [];

  public static readonly logger = createLogger({
    defaultMeta: { service: "portal" },
    transports: [
      ...LoggerUtility.fileTransports,
      ...LoggerUtility.consoleTransport,
    ],
  });
}

export default LoggerUtility.logger;
