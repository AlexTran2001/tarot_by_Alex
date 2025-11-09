const ADMIN_EMAIL = "admin@gmail.com";

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function checkIsAdmin(user: { email?: string | null } | null): boolean {
  if (!user || !user.email) return false;
  return isAdminEmail(user.email);
}

