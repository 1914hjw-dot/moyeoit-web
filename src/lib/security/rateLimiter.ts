import 'server-only';

import { supabaseServer } from '@/lib/supabase/server';
import {
  checkRateLimitWithBackend,
  clearRateLimitWithBackend,
  createRateLimitKey,
  isSensitiveScope,
  peekRateLimitWithBackend,
  type RateLimitOptions,
  type RateLimitResult,
  type RateLimitSupabaseClient,
} from './rateLimiterCore';

export { createRateLimitKey, isSensitiveScope };
export type { RateLimitOptions, RateLimitResult };

function getSupabaseRateLimitClient(): RateLimitSupabaseClient | null {
  return supabaseServer as unknown as RateLimitSupabaseClient | null;
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  return checkRateLimitWithBackend(getSupabaseRateLimitClient(), key, maxAttempts, windowMs, options);
}

export async function peekRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  return peekRateLimitWithBackend(getSupabaseRateLimitClient(), key, maxAttempts, windowMs, options);
}

export async function clearRateLimit(key: string, windowMs: number = 60_000): Promise<void> {
  return clearRateLimitWithBackend(getSupabaseRateLimitClient(), key, windowMs);
}
