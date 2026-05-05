import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-4xl font-black" style={{ color: 'var(--cat-work)' }}>stable.</p>
        <p className="text-sm mt-1" style={{ color: 'var(--stable-t2)' }}>Your focus companion</p>
      </div>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
