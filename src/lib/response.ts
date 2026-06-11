import { NextResponse } from 'next/server';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    durationMs: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
  };
}

export function successResponse<T>(
  data: T,
  durationMs: number = 0,
  requestId?: string
): NextResponse<SuccessResponse<T>> {
  const reqId = requestId || crypto.randomUUID();
  return NextResponse.json({
    success: true,
    data,
    meta: {
      requestId: reqId,
      durationMs,
    },
  });
}

export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any,
  requestId?: string
): NextResponse<ErrorResponse> {
  const reqId = requestId || crypto.randomUUID();
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: details || {},
      },
      meta: {
        requestId: reqId,
      },
    },
    { status }
  );
}
