import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy convention for validating and refreshing Supabase Auth sessions on admin routes.
 *
 * Scope:
 * - Scoped STRICTLY to `/admin/:path*`.
 * - Completely bypasses all public routes (`/`, `/room/*`, `/api/rooms/*`, `/contact`, `/guide/*`, etc.),
 *   ensuring 0% performance or functional impact on user schedule coordination.
 * - Uses Supabase's latest recommended `getClaims()` pattern for lightweight JWT verification and
 *   timely token refresh via refresh-token rotation.
 * - Enforces `Cache-Control: private, no-store` on all admin responses to prevent any CDN/Vercel
 *   shared caching of pages or session cookies.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isProduction = process.env.NODE_ENV === 'production';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            ...(isProduction ? { secure: true } : {}),
          })
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        }
      },
    },
  });

  // Validates JWT and automatically triggers session refresh when needed
  await supabase.auth.getClaims();

  // Enforce robust no-cache/no-store on admin responses so CDN/Vercel never caches session responses
  supabaseResponse.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
  supabaseResponse.headers.set('Pragma', 'no-cache');
  supabaseResponse.headers.set('Expires', '0');

  // Enforce search engine noindex on all admin routes
  supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
