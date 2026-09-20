import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/security/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminRootPage() {
  try {
    await verifyAdminSession();
    redirect('/admin/feedback');
  } catch {
    redirect('/admin/login');
  }
}
