import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'DD-MM-YY HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, service }) => `${timestamp} service: ${service} ${level}: ${message}`),
);

const fileFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YY HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, service }) => `${timestamp} service: ${service} ${level}: ${message}`),
  format.json(),
);

const fileTransports = [
  new transports.File({ filename: 'error.log', level: 'error', format: fileFormat, silent: true }),
  new transports.File({ filename: 'combined.log', format: fileFormat, silent: true }),
];

const consoleTransport = process.env['DEBUG'] ? [new transports.Console({ format: consoleFormat })] : [];

const logger = createLogger({
  defaultMeta: { service: 'portal' },
  transports: [...fileTransports, ...consoleTransport],
});

export default logger;
