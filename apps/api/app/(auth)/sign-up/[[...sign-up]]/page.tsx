import { SignUp } from '@clerk/nextjs'

const appearance = {
  variables: {
    colorPrimary:                  '#4A7A5F',
    colorBackground:               '#FFFFFF',
    colorText:                     '#1A2B1E',
    colorTextSecondary:            '#5A6B5E',
    colorInputBackground:          '#F5F9F6',
    colorInputText:                '#1A2B1E',
    colorTextOnPrimaryBackground:  '#FFFFFF',
    borderRadius:                  '16px',
    fontFamily:                    '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize:                      '14px',
  },
  elements: {
    card:                  'shadow-none border-0 bg-transparent p-0',
    rootBox:               'w-full',
    formButtonPrimary:     'rounded-full font-bold text-sm',
    socialButtonsBlockButton: 'rounded-full border border-[rgba(94,139,113,0.2)]',
    footerActionLink:      'text-[#4A7A5F] font-semibold',
    headerTitle:           'hidden',
    headerSubtitle:        'hidden',
  },
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Brand */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-[20px] flex items-center justify-center text-white font-black text-2xl mx-auto mb-5"
          style={{
            background: 'linear-gradient(135deg, #4A7A5F 0%, #5E8B71 100%)',
            boxShadow:  '0 10px 32px rgba(74,122,95,0.45)',
          }}
        >
          S
        </div>
        <h1 className="text-[28px] font-black leading-tight mb-1.5" style={{ color: '#1A2B1E' }}>
          stable.
        </h1>
        <p className="text-sm font-medium" style={{ color: '#7A9A82' }}>
          Start your journey to calmer focus
        </p>
      </div>

      {/* Card wrapper */}
      <div
        className="w-full rounded-[28px] p-8"
        style={{
          background: '#FFFFFF',
          boxShadow:  '0 4px 40px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.03)',
          border:     '1px solid rgba(94,139,113,0.12)',
        }}
      >
        <p className="text-lg font-black mb-6" style={{ color: '#1A2B1E' }}>Create your account</p>
        <SignUp fallbackRedirectUrl="/dashboard" appearance={appearance} />
      </div>
    </div>
  )
}
