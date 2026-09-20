import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/security/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminRootPage() {
  let authed = false;
  try {
    await verifyAdminSession();
    authed = true;
  } catch {
    authed = false;
  }

  if (authed) {
    redirect('/admin/feedback');
  } else {
    redirect('/admin/login');
  }
}
