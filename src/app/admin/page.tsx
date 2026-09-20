import { redirect } from 'next/navigation';
import { verifyAdminAal1Session, getAdminMfaRoutingStep } from '@/lib/security/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminRootPage() {
  let targetPath = '/admin/login';

  try {
    const { authClient } = await verifyAdminAal1Session();
    const mfaStatus = await getAdminMfaRoutingStep(authClient);

    if (mfaStatus.step === 'DASHBOARD') {
      targetPath = '/admin/feedback';
    } else if (mfaStatus.step === 'VERIFY') {
      targetPath = '/admin/mfa/verify';
    } else {
      targetPath = '/admin/mfa/setup';
    }
  } catch {
    targetPath = '/admin/login';
  }

  redirect(targetPath);
}
