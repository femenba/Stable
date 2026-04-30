import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">stable.</h1>
        <p className="text-gray-500 mt-1">Your focus companion</p>
      </div>
      <SignUp />
    </div>
  )
}
