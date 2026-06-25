---
name: error-handling
description: >
  Comprehensive guide for structured error handling in modern applications. Covers error
  classification, error boundaries, API error responses (RFC 7807), crash reporting,
  circuit breakers, retry strategies, graceful degradation, and error monitoring.
version: 1.0.0
trigger_keywords:
  - error
  - crash
  - exception
  - bug
  - Sentry
  - retry
  - fallback
  - error handling
  - error boundary
  - circuit breaker
  - try catch
  - exception handling
---

# Error Handling

## 1. Error Classification

### 1.1 Error Categories

| Category | Recoverable | Example | Strategy |
|----------|-------------|---------|----------|
| **Validation errors** | Yes | Invalid email format | Return 400, show user message |
| **Authentication errors** | Yes | Expired token | Return 401, redirect to login |
| **Authorization errors** | Yes | Insufficient permissions | Return 403, show access denied |
| **Not found errors** | Yes | Missing resource | Return 404, show helpful message |
| **Business logic errors** | Yes | Insufficient balance | Return 409/422, explain the issue |
| **Rate limit errors** | Yes (after wait) | Too many requests | Return 429, include Retry-After header |
| **Transient errors** | Yes (retry) | Database timeout, network glitch | Retry with backoff |
| **Infrastructure errors** | Maybe | Database down, disk full | Circuit breaker, fallback |
| **Programming errors** | No | Null reference, type error | Fix the code, crash early in dev |
| **Fatal errors** | No | Out of memory, corrupted state | Log, alert, restart process |

### 1.2 Operational vs Programmer Errors

| Aspect | Operational Errors | Programmer Errors |
|--------|-------------------|-------------------|
| **Cause** | External factors, expected failures | Bugs in code |
| **Examples** | Timeout, connection refused, invalid input | TypeError, null deref, assertion failure |
| **Strategy** | Handle gracefully, retry, degrade | Crash, fix, deploy |
| **Log level** | WARN or ERROR | ERROR or FATAL |
| **Alert** | Only if persistent | Immediately |

---

## 2. Structured Error Handling Patterns

### 2.1 Custom Error Classes (TypeScript/Node.js)

```typescript
// Base application error
class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    statusCode: number;
    code: string;
    isOperational?: boolean;
    details?: Record<string, unknown>;
    cause?: Error;
  }) {
    super(params.message, { cause: params.cause });
    this.name = this.constructor.name;
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.isOperational = params.isOperational ?? true;
    this.details = params.details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ message, statusCode: 400, code: 'VALIDATION_ERROR', details });
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super({
      message: `${resource} with id '${id}' not found`,
      statusCode: 404,
      code: 'NOT_FOUND',
      details: { resource, id },
    });
  }
}

class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ message, statusCode: 409, code: 'CONFLICT', details });
  }
}

class RateLimitError extends AppError {
  public readonly retryAfter: number;
  constructor(retryAfterSeconds: number) {
    super({
      message: 'Too many requests',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      details: { retryAfter: retryAfterSeconds },
    });
    this.retryAfter = retryAfterSeconds;
  }
}

class InternalError extends AppError {
  constructor(message: string, cause?: Error) {
    super({
      message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational: false,
      cause,
    });
  }
}
```

### 2.2 Error Codes Registry

Maintain a centralized error code registry:

```typescript
// errors/codes.ts
export const ErrorCodes = {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_1001', status: 401, message: 'Invalid credentials' },
  AUTH_TOKEN_EXPIRED:       { code: 'AUTH_1002', status: 401, message: 'Token has expired' },
  AUTH_INSUFFICIENT_PERMS:  { code: 'AUTH_1003', status: 403, message: 'Insufficient permissions' },
  AUTH_MFA_REQUIRED:        { code: 'AUTH_1004', status: 403, message: 'MFA verification required' },

  // Validation (2xxx)
  VALIDATION_FAILED:        { code: 'VAL_2001', status: 400, message: 'Validation failed' },
  VALIDATION_INVALID_EMAIL: { code: 'VAL_2002', status: 400, message: 'Invalid email format' },

  // Resources (3xxx)
  RESOURCE_NOT_FOUND:       { code: 'RES_3001', status: 404, message: 'Resource not found' },
  RESOURCE_ALREADY_EXISTS:  { code: 'RES_3002', status: 409, message: 'Resource already exists' },

  // Business Logic (4xxx)
  BIZ_INSUFFICIENT_BALANCE: { code: 'BIZ_4001', status: 422, message: 'Insufficient balance' },
  BIZ_ORDER_CANCELLED:      { code: 'BIZ_4002', status: 422, message: 'Order already cancelled' },

  // System (5xxx)
  SYS_DATABASE_ERROR:       { code: 'SYS_5001', status: 500, message: 'Database error' },
  SYS_EXTERNAL_SERVICE:     { code: 'SYS_5002', status: 502, message: 'External service error' },
} as const;
```

### 2.3 Result Type Pattern (Functional Error Handling)

```typescript
// Avoid exceptions for expected failures — use Result types
type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function findUser(id: string): Promise<Result<User>> {
  const user = await db.users.findUnique({ where: { id } });
  if (!user) {
    return { success: false, error: new NotFoundError('User', id) };
  }
  return { success: true, data: user };
}

// Caller
const result = await findUser('abc');
if (!result.success) {
  // Handle error — TypeScript narrows the type
  console.log(result.error.code);
  return;
}
// Use result.data safely
console.log(result.data.name);
```

---

## 3. Error Boundaries (React)

### 3.1 Class-Based Error Boundary

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to crash reporting service
    console.error('Error boundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Send to Sentry/Bugsnag
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 3.2 Error Boundary Strategy

```
App Layout
├── ErrorBoundary (top-level — catches everything, shows full-page error)
│   ├── Header
│   ├── ErrorBoundary (route-level — catches page errors)
│   │   ├── Route: /dashboard
│   │   │   ├── ErrorBoundary (widget-level — isolates widget crashes)
│   │   │   │   └── StatsWidget
│   │   │   ├── ErrorBoundary
│   │   │   │   └── ChartWidget
│   │   │   └── ErrorBoundary
│   │   │       └── ActivityFeed
│   │   └── Route: /settings
│   └── Footer
```

**Placement rules:**
- **Top level**: Catch-all, shows "something went wrong" page
- **Route level**: Each page gets its own boundary, prevents one broken page from crashing the app
- **Widget level**: Isolate independent components that might fail (3rd-party widgets, data-driven charts)

---

## 4. API Error Responses

### 4.1 RFC 7807 Problem Details

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid fields",
  "instance": "/api/users/123",
  "traceId": "abc-123-def-456",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "code": "INVALID_FORMAT"
    },
    {
      "field": "age",
      "message": "Must be at least 18",
      "code": "MIN_VALUE"
    }
  ]
}
```

### 4.2 Error Response Structure

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | URI reference for the error type (documentation link) |
| `title` | Yes | Short, human-readable summary |
| `status` | Yes | HTTP status code |
| `detail` | Yes | Human-readable explanation specific to this occurrence |
| `instance` | No | URI of the specific request that caused the error |
| `traceId` | Recommended | Correlation ID for tracing through logs |
| `errors` | For validation | Array of field-level errors |
| `code` | Recommended | Machine-readable error code from registry |

### 4.3 Global Error Handler (Express.js)

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log the error
  const traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  
  if (err instanceof AppError) {
    // Operational error — expected, safe to return details
    logger.warn({
      traceId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      type: `https://api.example.com/errors/${err.code.toLowerCase()}`,
      title: err.name,
      status: err.statusCode,
      detail: err.message,
      instance: req.originalUrl,
      traceId,
      code: err.code,
      ...(err.details && { errors: err.details }),
    });
  }

  // Programmer error — unexpected, don't leak details
  logger.error({
    traceId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Report to crash reporting
  Sentry.captureException(err, { extra: { traceId, path: req.path } });

  return res.status(500).json({
    type: 'https://api.example.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred. Please try again later.',
    instance: req.originalUrl,
    traceId,
    code: 'INTERNAL_ERROR',
  });
}
```

### 4.4 HTTP Status Code Reference

| Code | Meaning | When to Use |
|------|---------|-------------|
| **400** | Bad Request | Malformed syntax, invalid JSON |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Authenticated but insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate resource, state conflict |
| **422** | Unprocessable Entity | Valid syntax but invalid semantics (validation errors) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server failure |
| **502** | Bad Gateway | Upstream service failure |
| **503** | Service Unavailable | Maintenance, overloaded |
| **504** | Gateway Timeout | Upstream service timeout |

---

## 5. Crash Reporting Setup

### 5.1 Sentry

```typescript
// sentry.ts — Initialize early in application startup
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filter out known non-issues
  ignoreErrors: [
    'AbortError',
    'Network request failed',
    'ResizeObserver loop limit exceeded',
  ],
  
  // Scrub sensitive data
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },

  // Add context
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('/health')) {
      return null;  // Don't track health check requests
    }
    return breadcrumb;
  },
});

// Add user context after authentication
Sentry.setUser({ id: user.id, email: user.email });

// Add custom tags
Sentry.setTag('tenant', tenantId);
```

### 5.2 Crash Reporting Comparison

| Feature | Sentry | Bugsnag | LogRocket |
|---------|--------|---------|-----------|
| **Type** | Error tracking | Error tracking | Session replay + errors |
| **Platforms** | All (JS, Python, Go, etc.) | All major | Web + mobile |
| **Session replay** | Yes (paid) | No | ✅ Core feature |
| **Performance monitoring** | ✅ Built-in | Basic | ✅ Built-in |
| **Source maps** | ✅ Upload support | ✅ Upload support | ✅ Automatic |
| **Alerting** | Slack, PagerDuty, email | Slack, PagerDuty, email | Slack, email |
| **Self-hosted** | ✅ Yes | ❌ No | ❌ No |
| **Free tier** | 5k events/month | 7.5k events/month | 1k sessions/month |
| **Best for** | All-around error tracking | Simple setup, stability | Reproducing visual bugs |

### 5.3 What to Capture

| Always Capture | Never Capture |
|----------------|---------------|
| Error message and stack trace | Passwords, tokens, API keys |
| Request URL, method, status | Credit card numbers, SSN |
| User ID (anonymized if needed) | Full request/response bodies (by default) |
| Browser/device info | PHI/PII without consent |
| Application version/release | Customer data in error messages |
| Breadcrumbs (navigation, clicks) | Raw SQL queries with parameters |
| Environment (staging, prod) | Internal infrastructure details |

---

## 6. Circuit Breaker Pattern

### 6.1 States

```
         ┌─────────────────────────────────────────┐
         │                                         │
         ▼                                         │
    ┌─────────┐    failures > threshold    ┌──────────┐
    │  CLOSED  │ ─────────────────────────►│   OPEN   │
    │ (normal) │                           │ (failing)│
    └─────────┘                           └──────────┘
         ▲                                    │
         │              timeout expires       │
         │                                    ▼
         │                            ┌───────────────┐
         │  success                   │  HALF-OPEN    │
         └────────────────────────────│  (testing)    │
                                      └───────────────┘
                        failure → back to OPEN
```

### 6.2 Implementation

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  
  constructor(
    private readonly threshold: number = 5,       // failures before opening
    private readonly timeout: number = 30000,      // ms before trying again
    private readonly monitorWindow: number = 60000 // ms to count failures in
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime ?? 0) > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const paymentCircuit = new CircuitBreaker(5, 30000);

const result = await paymentCircuit.execute(
  () => paymentService.charge(amount),
  () => ({ status: 'QUEUED', message: 'Payment will be processed shortly' })
);
```

### 6.3 When to Use Circuit Breakers

| Use For | Don't Use For |
|---------|---------------|
| External API calls | Database queries (use connection pool instead) |
| Payment processing | Local file system operations |
| Email/SMS services | In-memory computations |
| Third-party integrations | Validation logic |
| Microservice-to-microservice calls | Static configuration loading |

---

## 7. Retry Strategies

### 7.1 Exponential Backoff with Jitter

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableErrors?: string[];
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, retryableErrors } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry non-retryable errors
      if (retryableErrors && !retryableErrors.includes((error as any).code)) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with full jitter
      const delay = Math.min(
        maxDelay,
        Math.random() * baseDelay * Math.pow(2, attempt)
      );
      
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

// Usage
const data = await retryWithBackoff(
  () => fetch('https://api.example.com/data').then(r => r.json()),
  { maxRetries: 3, baseDelay: 1000, retryableErrors: ['ECONNRESET', 'ETIMEDOUT'] }
);
```

### 7.2 Retry Strategy Comparison

| Strategy | Formula | Best For |
|----------|---------|----------|
| **Fixed delay** | `delay = constant` | Simple cases, testing |
| **Linear backoff** | `delay = attempt * baseDelay` | Moderate load |
| **Exponential backoff** | `delay = baseDelay * 2^attempt` | External APIs, rate limits |
| **Exponential + jitter** | `delay = random(0, baseDelay * 2^attempt)` | ✅ Recommended default |
| **Decorrelated jitter** | `delay = random(baseDelay, prevDelay * 3)` | High concurrency |

### 7.3 Dead Letter Queues

```
Normal Queue                     Dead Letter Queue
┌─────────────────┐              ┌──────────────────┐
│ Message arrives  │              │ Failed messages   │
│ → Process        │──3 retries──►│ → Manual review   │
│ → Acknowledge    │   failed     │ → Alert ops team  │
└─────────────────┘              │ → Fix & replay    │
                                 └──────────────────┘
```

**Rules for DLQ:**
- Set a max retry count (typically 3–5)
- Include original message + error details + attempt count
- Monitor DLQ depth as a key metric
- Build tooling to inspect, fix, and replay messages
- Alert when DLQ depth exceeds threshold

### 7.4 Idempotency for Safe Retries

```typescript
// Use idempotency keys to prevent duplicate processing
app.post('/api/payments', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header required' });
  }

  // Check if already processed
  const existing = await cache.get(`idempotency:${idempotencyKey}`);
  if (existing) {
    return res.status(200).json(JSON.parse(existing));  // Return cached result
  }

  // Process the payment
  const result = await processPayment(req.body);

  // Cache result for 24 hours
  await cache.set(`idempotency:${idempotencyKey}`, JSON.stringify(result), 86400);

  return res.status(201).json(result);
});
```

---

## 8. Graceful Degradation

### 8.1 Degradation Strategies

| Strategy | Example |
|----------|---------|
| **Cached response** | Serve stale data when the upstream API is down |
| **Default value** | Show placeholder avatar when image service fails |
| **Feature toggle** | Disable recommendations when ML service is slow |
| **Queue for later** | Queue email when SMTP server is unavailable |
| **Reduced functionality** | Show read-only mode when write DB is down |
| **Static fallback** | Serve static HTML when rendering service crashes |

### 8.2 User-Facing vs Internal Error Messages

| Context | User Sees | Internal Log |
|---------|-----------|--------------|
| **Database error** | "We're experiencing technical difficulties. Please try again." | `PostgresError: connection refused to db-primary:5432, query: SELECT * FROM users WHERE id = $1` |
| **Validation error** | "Please enter a valid email address" | `ValidationError: email field failed regex check, input: "not-an-email"` |
| **Payment failure** | "Payment could not be processed. Please try another method." | `StripeError: card_declined, decline_code: insufficient_funds, customer: cus_xxx` |
| **Rate limit** | "You're making requests too quickly. Please wait 30 seconds." | `RateLimitError: user user-123 exceeded 100 req/min on POST /api/orders` |
| **Auth error** | "Invalid email or password" (never reveal which is wrong) | `AuthError: password mismatch for user user-123 (email: a@b.com)` |

---

## 9. Error Monitoring & Alerting

### 9.1 Key Error Metrics

| Metric | Alert Threshold | Description |
|--------|----------------|-------------|
| **Error rate** | > 1% of requests | Percentage of 5xx responses |
| **Error count spike** | > 3x normal rate | Sudden increase in errors |
| **P99 latency** | > 5 seconds | Slow responses often precede errors |
| **Unhandled exceptions** | > 0 (new errors) | Any new unhandled error type |
| **DLQ depth** | > 100 messages | Failed async messages accumulating |
| **Circuit breaker opens** | Any transition | External dependency failure |
| **4xx error rate** | > 10% | Client-side issues or API misuse |

### 9.2 Alert Configuration

```yaml
# Example alerting rules (Prometheus/Grafana format)
groups:
  - name: error-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected (> 1%)"
          
      - alert: ErrorRateSpike
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 3 * rate(http_requests_total{status=~"5.."}[1h] offset 1d)
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Error rate is 3x above normal"
          
      - alert: UnhandledException
        expr: increase(unhandled_exceptions_total[5m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "New unhandled exception detected"
```

### 9.3 Error Handling Checklist

| Category | Item | Status |
|----------|------|--------|
| **Structure** | Custom error classes with codes | ☐ |
| **Structure** | Centralized error code registry | ☐ |
| **Structure** | Global error handler middleware | ☐ |
| **API** | RFC 7807 error response format | ☐ |
| **API** | Trace ID in every error response | ☐ |
| **API** | Never leak internal details to clients | ☐ |
| **Frontend** | Error boundaries at route + widget level | ☐ |
| **Frontend** | User-friendly error messages | ☐ |
| **Reporting** | Crash reporting service configured (Sentry) | ☐ |
| **Reporting** | Source maps uploaded for production | ☐ |
| **Reporting** | Sensitive data scrubbed from reports | ☐ |
| **Resilience** | Circuit breakers for external services | ☐ |
| **Resilience** | Retry with exponential backoff + jitter | ☐ |
| **Resilience** | Idempotency keys for critical operations | ☐ |
| **Resilience** | Dead letter queues for async failures | ☐ |
| **Resilience** | Graceful degradation / fallbacks | ☐ |
| **Monitoring** | Error rate alerting configured | ☐ |
| **Monitoring** | Error dashboard with trends | ☐ |
| **Monitoring** | On-call runbook for common errors | ☐ |
| **Process** | Error handling in code review checklist | ☐ |
| **Process** | Post-incident reviews for production errors | ☐ |
