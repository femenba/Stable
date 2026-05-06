export const ADMIN_EMAIL = 'femenbaa@gmail.com'

export function getUserPlan(email: string): 'pro' | 'free' {
  return email === ADMIN_EMAIL ? 'pro' : 'free'
}

export function isAdminUser(email: string): boolean {
  return email === ADMIN_EMAIL
}
