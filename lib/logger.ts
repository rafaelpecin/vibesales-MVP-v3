import pino, { type Logger as PinoLogger } from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Root pino logger instance.
 * In development, uses pino-pretty for human-readable output.
 * In production, emits newline-delimited JSON for log aggregators (e.g. Vercel, Datadog).
 */
const rootLogger: PinoLogger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    base: { env: process.env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      })
    : undefined,
);

/**
 * Creates a child logger bound to a specific module/context.
 * Use this in each module to tag all logs with their source.
 *
 * @param context - A label identifying the module (e.g. "api/scan", "lib/gemini")
 * @returns A child pino Logger instance with the context bound
 *
 * @example
 * const logger = createLogger("api/scan");
 * logger.info({ userId }, "Scan started");
 */
export function createLogger(context: string): PinoLogger {
  return rootLogger.child({ context });
}

/**
 * Default logger for cases where a per-module logger is not needed.
 * Prefer `createLogger(context)` for module-level logging.
 */
export const logger = rootLogger;

export type { PinoLogger as Logger };
