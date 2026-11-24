import { createHash } from 'node:crypto';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeSeconds: number;
  backendUnavailable?: boolean;
}

export interface RateLimitOptions {
  failClosed?: boolean;
  forceFailClosed?: boolean;
}

export interface RateLimitSupabaseClient {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => PromiseLike<{
          data: { request_count?: unknown; reset_at?: unknown } | null;
          error: { message?: string } | null;
        }>;
      };
    };
    delete: () => {
      eq: (column: string, value: string) => PromiseLike<{ error: { message?: string } | null }>;
    };
  };
}

interface MemoryRateLimitRecord {
  count: number;
  resetTime: number;
}

const IN_MEMORY_STORE = new Map<string, MemoryRateLimitRecord>();

const SENSITIVE_SCOPE_PREFIXES = [
  'vote-auth:',
  'vote-write:',
  'vote-pin-fail',
  'vote-pin-ip-fail',
  'vote-legacy-mutation:',
  'room-confirm:',
  'admin-login',
  'admin-mfa',
  'vote-delete:',
];

export function isSensitiveScope(key: string): boolean {
  return SENSITIVE_SCOPE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function createRateLimitKey(scope: string, identifier: string): string {
  const digest = createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
  return `${scope}:${digest}`;
}

export function clearMemoryRateLimitStore(): void {
  IN_MEMORY_STORE.clear();
}

function getUpstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function shouldEnforceFailClosed(
  key: string,
  supabase: RateLimitSupabaseClient | null,
  options?: RateLimitOptions
): boolean {
  const failClosed = options?.failClosed ?? isSensitiveScope(key);
  if (!failClosed) return false;
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDistributedBackend = Boolean(getUpstashConfig() || supabase !== null);
  return isProduction || hasDistributedBackend || Boolean(options?.forceFailClosed);
}

function unavailableResult(): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetTimeSeconds: 60,
    backendUnavailable: true,
  };
}

async function checkUpstash(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const upstash = getUpstashConfig();
  if (!upstash) return null;

  try {
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${bucket}`;
    const response = await fetch(`${upstash.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstash.token}`,
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

async function peekUpstash(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const upstash = getUpstashConfig();
  if (!upstash) return null;

  try {
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${bucket}`;
    const response = await fetch(`${upstash.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstash.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['GET', redisKey],
        ['PTTL', redisKey],
      ]),
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ result?: string | number | null }>;
    const rawCount = data[0]?.result;
    const count = rawCount === null || rawCount === undefined ? 0 : Number(rawCount);
    if (!Number.isFinite(count) || count <= 0) {
      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts),
        resetTimeSeconds: Math.ceil(windowMs / 1000),
      };
    }

    const pttlMs = Number(data[1]?.result ?? -1);
    const resetTimeSeconds =
      Number.isFinite(pttlMs) && pttlMs > 0
        ? Math.max(1, Math.ceil(pttlMs / 1000))
        : Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000));

    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
      resetTimeSeconds,
    };
  } catch (error) {
    console.warn('Upstash rate limit peek failed; trying database fallback.', error);
    return null;
  }
}

async function clearUpstash(key: string, windowMs: number): Promise<boolean> {
  const upstash = getUpstashConfig();
  if (!upstash) return false;

  try {
    const bucket = Math.floor(Date.now() / windowMs);
    const redisKey = `ratelimit:${key}:${bucket}`;
    const prevRedisKey = `ratelimit:${key}:${bucket - 1}`;
    const response = await fetch(`${upstash.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstash.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([['DEL', redisKey, prevRedisKey]]),
      cache: 'no-store',
    });
    return response.ok;
  } catch (error) {
    console.warn('Upstash rate limit clear failed:', error);
    return false;
  }
}

async function checkSupabase(
  supabase: RateLimitSupabaseClient | null,
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
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
    console.warn('Database rate limit check failed.', error);
    return null;
  }
}

async function peekSupabase(
  supabase: RateLimitSupabaseClient | null,
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('rate_limit_buckets')
      .select('request_count, reset_at')
      .eq('key', key)
      .maybeSingle();

    if (error) return null;

    const now = Date.now();
    if (!data || !data.reset_at) {
      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts),
        resetTimeSeconds: Math.ceil(windowMs / 1000),
      };
    }

    const resetMs = new Date(String(data.reset_at)).getTime();
    if (!Number.isFinite(resetMs) || resetMs <= now) {
      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts),
        resetTimeSeconds: Math.ceil(windowMs / 1000),
      };
    }

    const count = Number(data.request_count ?? 0);
    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
      resetTimeSeconds: Math.max(1, Math.ceil((resetMs - now) / 1000)),
    };
  } catch (error) {
    console.warn('Database rate limit peek failed.', error);
    return null;
  }
}

async function clearSupabase(supabase: RateLimitSupabaseClient | null, key: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('rate_limit_buckets').delete().eq('key', key);
    return !error;
  } catch (error) {
    console.warn('Database rate limit clear failed:', error);
    return false;
  }
}

function checkMemory(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = IN_MEMORY_STORE.get(key);

  if (!record || now >= record.resetTime) {
    IN_MEMORY_STORE.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: 1 <= maxAttempts,
      remaining: Math.max(0, maxAttempts - 1),
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

function peekMemory(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = IN_MEMORY_STORE.get(key);
  if (!record || now >= record.resetTime) {
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts),
      resetTimeSeconds: Math.ceil(windowMs / 1000),
    };
  }

  return {
    allowed: record.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.count),
    resetTimeSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
  };
}

export async function checkRateLimitWithBackend(
  supabase: RateLimitSupabaseClient | null,
  key: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  const distributedResult =
    (await checkUpstash(key, maxAttempts, windowMs)) ??
    (await checkSupabase(supabase, key, maxAttempts, windowMs));

  if (distributedResult) return distributedResult;
  if (shouldEnforceFailClosed(key, supabase, options)) return unavailableResult();

  return checkMemory(key, maxAttempts, windowMs);
}

export async function peekRateLimitWithBackend(
  supabase: RateLimitSupabaseClient | null,
  key: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  const distributedResult =
    (await peekUpstash(key, maxAttempts, windowMs)) ??
    (await peekSupabase(supabase, key, maxAttempts, windowMs));

  if (distributedResult) return distributedResult;
  if (shouldEnforceFailClosed(key, supabase, options)) return unavailableResult();

  return peekMemory(key, maxAttempts, windowMs);
}

export async function clearRateLimitWithBackend(
  supabase: RateLimitSupabaseClient | null,
  key: string,
  windowMs: number = 60_000
): Promise<void> {
  await clearUpstash(key, windowMs);
  await clearSupabase(supabase, key);
  IN_MEMORY_STORE.delete(key);
}
