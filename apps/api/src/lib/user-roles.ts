export const ADMIN_EMAIL = 'femenbaa@gmail.com'

type UserLike = { emailAddresses?: Array<{ emailAddress: string }> } | null | undefined

function emailOf(user: UserLike): string {
  return user?.emailAddresses?.[0]?.emailAddress ?? ''
}

export function getUserPlan(email: string): 'pro' | 'free' {
  return email === ADMIN_EMAIL ? 'pro' : 'free'
}

export function isAdminUser(email: string): boolean {
  return email === ADMIN_EMAIL
}

export function isAdmin(user: UserLike): boolean {
  return isAdminUser(emailOf(user))
}

export function getUserPlanFromUser(user: UserLike): 'pro' | 'free' {
  return getUserPlan(emailOf(user))
}

export function canAccessAdmin(user: UserLike): boolean {
  return isAdmin(user)
}
