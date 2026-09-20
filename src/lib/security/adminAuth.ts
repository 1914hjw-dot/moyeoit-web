import 'server-only';

import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import { AppError } from '@/lib/errors';
import { isEmailInAdminWhitelist } from '@/lib/security/adminWhitelist';
import type { User } from '@supabase/supabase-js';

export { isEmailInAdminWhitelist };

/**
 * Server-side verification for admin sessions.
 * Resolves user from Supabase Auth SSR session and verifies against ADMIN_EMAILS whitelist.
 * Throws AppError(401) if not logged in, or AppError(403) if not an authorized admin.
 */
export async function verifyAdminSession(): Promise<{ user: User; email: string }> {
  const authClient = await createAdminAuthClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user || !user.email) {
    throw new AppError('관리자 로그인이 필요합니다.', 401, 'UNAUTHORIZED');
  }

  if (!isEmailInAdminWhitelist(user.email)) {
    throw new AppError('관리자 권한이 없습니다.', 403, 'FORBIDDEN');
  }

  return { user, email: user.email };
}
