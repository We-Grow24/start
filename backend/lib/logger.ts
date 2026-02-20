// ═══════════════════════════════════════════════════════════════
// SVARNEX — lib/logger.ts
// S6-D-03: Structured logging utility
// JSON-formatted in production, pretty-printed in development
// ═══════════════════════════════════════════════════════════════

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogContext {
  route?: string;
  user_id?: string;
  project_id?: string;
  request_id?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    return JSON.stringify(entry);
  }

  // Pretty-print in development
  const prefix = `[${entry.level.toUpperCase().padEnd(5)}]`;
  const ts = entry.timestamp.split("T")[1]?.replace("Z", "") ?? entry.timestamp;
  const ctx = entry.context
    ? ` ${Object.entries(entry.context)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(" ")}`
    : "";
  const errStr = entry.error ? ` | ${entry.error.name}: ${entry.error.message}` : "";
  return `${ts} ${prefix} ${entry.message}${ctx}${errStr}`;
}

function log(level: LogLevel, message: string, context?: LogContext, err?: unknown): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (err instanceof Error) {
    entry.error = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }

  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
    case "info":
      console.log(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
    case "fatal":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext, err?: unknown) => log("warn", message, context, err),
  error: (message: string, context?: LogContext, err?: unknown) => log("error", message, context, err),
  fatal: (message: string, context?: LogContext, err?: unknown) => log("fatal", message, context, err),

  /**
   * Create a child logger with pre-bound context.
   * Useful for request-scoped logging.
   */
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext, err?: unknown) =>
      log("warn", message, { ...baseContext, ...context }, err),
    error: (message: string, context?: LogContext, err?: unknown) =>
      log("error", message, { ...baseContext, ...context }, err),
    fatal: (message: string, context?: LogContext, err?: unknown) =>
      log("fatal", message, { ...baseContext, ...context }, err),
  }),
} as const;
