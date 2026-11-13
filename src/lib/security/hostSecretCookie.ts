import 'server-only';

import type { NextRequest, NextResponse } from 'next/server';

const HOST_SECRET_COOKIE_PREFIX = 'moyeoit_host_secret_';
const HOST_SECRET_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function toHostSecretCookieName(identifier: string): string {
  const normalized = identifier.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return `${HOST_SECRET_COOKIE_PREFIX}${normalized}`;
}

export function attachHostSecretCookies(
  response: NextResponse,
  room: { id: string; legacy_slug?: string | null; host_secret?: string }
): void {
  if (!room.host_secret) return;

  const isProduction = process.env.NODE_ENV === 'production';
  const identifiers = Array.from(new Set([room.id, room.legacy_slug].filter(Boolean) as string[]));

  for (const identifier of identifiers) {
    response.cookies.set(toHostSecretCookieName(identifier), room.host_secret, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/api/rooms',
      maxAge: HOST_SECRET_COOKIE_MAX_AGE_SECONDS,
    });
  }
}

export function extractHostSecretFromCookies(
  request: NextRequest,
  identifiers: Array<string | null | undefined>
): string {
  for (const identifier of identifiers) {
    if (!identifier) continue;
    const value = request.cookies.get(toHostSecretCookieName(identifier))?.value?.trim();
    if (value) return value;
  }
  return '';
}
