import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-4xl font-black" style={{ color: 'var(--cat-work)' }}>stable.</p>
        <p className="text-sm mt-1" style={{ color: 'var(--stable-t2)' }}>Your focus companion</p>
      </div>
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
