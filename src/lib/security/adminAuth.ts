import 'server-only';

import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import { AppError } from '@/lib/errors';
import { isEmailInAdminWhitelist } from '@/lib/security/adminWhitelist';
import type { User } from '@supabase/supabase-js';

export { isEmailInAdminWhitelist };

export type AdminMfaStep = 'SETUP' | 'VERIFY' | 'DASHBOARD';

export interface VerifiedTotpFactor {
  id: string;
  friendlyName: string;
  createdAt: string;
}

export interface AdminMfaStatus {
  step: AdminMfaStep;
  currentLevel: 'aal1' | 'aal2';
  nextLevel: 'aal1' | 'aal2';
  factors: VerifiedTotpFactor[];
  defaultFactorId: string | null;
}

/**
 * Evaluates the official Supabase MFA status and determines the next routing step.
 *
 * Routing logic based on official AAL:
 * - currentLevel='aal1', nextLevel='aal1' -> MFA not enrolled -> 'SETUP'
 * - currentLevel='aal1', nextLevel='aal2' -> Verified MFA exists, session not upgraded -> 'VERIFY'
 * - currentLevel='aal2', nextLevel='aal2' -> Verified & active session -> 'DASHBOARD'
 *
 * listFactors() is used as auxiliary information to identify factor IDs and names.
 */
export async function getAdminMfaRoutingStep(
  authClient: Awaited<ReturnType<typeof createAdminAuthClient>>
): Promise<AdminMfaStatus> {
  const { data: aalData } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentLevel = (aalData?.currentLevel as 'aal1' | 'aal2') || 'aal1';
  const nextLevel = (aalData?.nextLevel as 'aal1' | 'aal2') || 'aal1';

  const { data: factorsData } = await authClient.auth.mfa.listFactors();
  const factors: VerifiedTotpFactor[] = (factorsData?.totp || [])
    .filter((f) => f.status === 'verified')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Most recently added first
    .map((f) => ({
      id: f.id,
      friendlyName: f.friendly_name || 'TOTP Authenticator',
      createdAt: f.created_at,
    }));

  let step: AdminMfaStep = 'SETUP';
  if (currentLevel === 'aal2' && nextLevel === 'aal2') {
    step = 'DASHBOARD';
  } else if (currentLevel === 'aal1' && nextLevel === 'aal2') {
    step = 'VERIFY';
  } else {
    step = 'SETUP';
  }

  return {
    step,
    currentLevel,
    nextLevel,
    factors,
    defaultFactorId: factors[0]?.id || null,
  };
}

/**
 * Server-side verification for AAL1 admin session.
 * Used exclusively for MFA setup, challenge, verification, and session status endpoints.
 * Resolves user from Supabase Auth SSR session and verifies against ADMIN_EMAILS whitelist.
 * Throws AppError(401) if not logged in, or AppError(403) if not in admin whitelist.
 */
export async function verifyAdminAal1Session(): Promise<{
  user: User;
  email: string;
  authClient: Awaited<ReturnType<typeof createAdminAuthClient>>;
}> {
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

  return { user, email: user.email, authClient };
}

/**
 * Server-side verification for full admin privileges (AAL2).
 * Used by all protected admin API endpoints (/api/admin/feedback/*, /api/admin/notices/*).
 *
 * Requirements:
 * 1. Authenticated user session
 * 2. ADMIN_EMAILS whitelist match
 * 3. MFA Authenticator Assurance Level === 'aal2'
 *
 * Rejects AAL1 sessions with 403 (MFA_REQUIRED).
 */
export async function verifyAdminSession(): Promise<{ user: User; email: string }> {
  const { user, email, authClient } = await verifyAdminAal1Session();

  const { data: aalData, error: aalError } =
    await authClient.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError || aalData?.currentLevel !== 'aal2') {
    throw new AppError('2단계 인증(MFA)이 필요합니다.', 403, 'MFA_REQUIRED');
  }

  return { user, email };
}
