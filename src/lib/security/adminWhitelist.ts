/**
 * Checks whether an email address is included in the ADMIN_EMAILS whitelist.
 * Pure utility function without server-only or framework dependencies for testability.
 */
export function isEmailInAdminWhitelist(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  const rawAdminEmails = process.env.ADMIN_EMAILS || '';
  const adminEmails = rawAdminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(normalizedEmail);
}
