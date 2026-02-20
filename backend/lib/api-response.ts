// ═══════════════════════════════════════════════════════════════
// SVARNEX — lib/api-response.ts
// S6-D-02: Standardized API response envelope
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

/**
 * Error code catalog for consistent API error reporting.
 */
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INSUFFICIENT_CHIPS: "INSUFFICIENT_CHIPS",
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  CONTENT_MODERATION: "CONTENT_MODERATION",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  EXPIRED: "EXPIRED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

interface SuccessEnvelope<T> {
  ok: true;
  data: T;
  ts: string;
}

interface ErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  ts: string;
}

/**
 * Create a standardized success response.
 */
export function ok<T>(data: T, status = 200): NextResponse<SuccessEnvelope<T>> {
  return NextResponse.json(
    {
      ok: true as const,
      data,
      ts: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create a standardized error response.
 */
export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ErrorEnvelope> {
  return NextResponse.json(
    {
      ok: false as const,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      ts: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Common shorthand helpers.
 */
export const ApiResponse = {
  ok,
  fail,
  unauthorized: (message = "Authentication required") =>
    fail(ERROR_CODES.UNAUTHORIZED, message, 401),
  forbidden: (message = "Access denied") =>
    fail(ERROR_CODES.FORBIDDEN, message, 403),
  notFound: (resource = "Resource") =>
    fail(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404),
  validationError: (message: string, details?: unknown) =>
    fail(ERROR_CODES.VALIDATION_ERROR, message, 400, details),
  conflict: (message: string) =>
    fail(ERROR_CODES.CONFLICT, message, 409),
  rateLimited: (message = "Rate limit exceeded") =>
    fail(ERROR_CODES.RATE_LIMITED, message, 429),
  insufficientChips: (required: number, balance: number) =>
    fail(ERROR_CODES.INSUFFICIENT_CHIPS, "Insufficient chips", 402, { required, balance }),
  internalError: (message = "Internal server error") =>
    fail(ERROR_CODES.INTERNAL_ERROR, message, 500),
} as const;
