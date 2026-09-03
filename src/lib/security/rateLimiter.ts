import 'server-only';

import { createHash } from 'node:crypto';
import { supabaseServer } from '@/lib/supabase/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const IN_MEMORY_STORE = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeSeconds: number;
}

export function createRateLimitKey(scope: string, identifier: string): string {
  const digest = createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
  return `${scope}:${digest}`;
}

async function checkUpstash(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken) return null;

  try {
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${bucket}`;
    const response = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, Math.ceil(windowMs / 1000) + 1],
      ]),
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ result?: number }>;
    const count = Number(data[0]?.result ?? 1);
    const resetTimeSeconds = Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000));
    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
      resetTimeSeconds,
    };
  } catch (error) {
    console.warn('Upstash rate limit check failed; trying database fallback.', error);
    return null;
  }
}

async function checkSupabase(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (!supabaseServer) return null;

  try {
    const { data, error } = await supabaseServer.rpc('check_rate_limit', {
      p_key: key,
      p_limit: maxAttempts,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });
    if (error || !data) return null;

    const result = Array.isArray(data) ? data[0] : data;
    if (!result || typeof result.allowed !== 'boolean') return null;

    return {
      allowed: result.allowed,
      remaining: Math.max(0, Number(result.remaining ?? 0)),
      resetTimeSeconds: Math.max(1, Number(result.reset_time_seconds ?? Math.ceil(windowMs / 1000))),
    };
  } catch (error) {
    console.warn('Database rate limit check failed; using local fallback.', error);
    return null;
  }
}

function checkMemory(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = IN_MEMORY_STORE.get(key);

  if (!record || now >= record.resetTime) {
    IN_MEMORY_STORE.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTimeSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  if (IN_MEMORY_STORE.size > 1_000) {
    for (const [storedKey, storedRecord] of IN_MEMORY_STORE.entries()) {
      if (now >= storedRecord.resetTime) IN_MEMORY_STORE.delete(storedKey);
    }
  }

  return {
    allowed: record.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.count),
    resetTimeSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
  };
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  return (
    (await checkUpstash(key, maxAttempts, windowMs)) ??
    (await checkSupabase(key, maxAttempts, windowMs)) ??
    checkMemory(key, maxAttempts, windowMs)
  );
}
