export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string; // ISO String
}

export interface RateLimiter {
  check(identifier: string, endpoint: string, limitPerHour: number): Promise<{ success: boolean; info: RateLimitInfo }>;
}
