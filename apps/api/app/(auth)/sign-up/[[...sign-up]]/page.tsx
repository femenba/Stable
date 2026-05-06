import { SignUp } from '@clerk/nextjs'

const appearance = {
  variables: {
    colorPrimary:                 '#4A7A5F',
    colorBackground:              '#FFFFFF',
    colorText:                    '#1A2B1E',
    colorTextSecondary:           '#5A6B5E',
    colorInputBackground:         '#F5F9F6',
    colorInputText:               '#1A2B1E',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorDanger:                  '#C05570',
    borderRadius:                 '12px',
    fontFamily:                   '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize:                     '14px',
    spacingUnit:                  '16px',
  },
  elements: {
    rootBox:  { width: '100%', maxWidth: '100%' },
    cardBox:  {
      width:        '100%',
      maxWidth:     '100%',
      minWidth:     'unset',
      boxShadow:    '0 4px 40px rgba(0,0,0,0.07), 0 1px 8px rgba(0,0,0,0.04)',
      border:       '1px solid rgba(94,139,113,0.12)',
      borderRadius: '24px',
    },
    card:             { padding: '28px 24px', width: '100%', boxShadow: 'none', border: 'none' },
    headerTitle:      { fontSize: '18px', fontWeight: '900', color: '#1A2B1E' },
    headerSubtitle:   { color: '#5A6B5E', fontSize: '13px' },
    socialButtonsBlockButton: {
      borderRadius:  '100px',
      borderColor:   'rgba(94,139,113,0.2)',
      fontWeight:    '600',
      fontSize:      '14px',
    },
    formFieldInput: {
      borderRadius: '12px',
      borderColor:  'rgba(94,139,113,0.2)',
    },
    formButtonPrimary: {
      borderRadius:  '100px',
      fontWeight:    '700',
      fontSize:      '14px',
      background:    'linear-gradient(135deg, #4A7A5F 0%, #5E8B71 100%)',
    },
    footerActionLink: { color: '#4A7A5F', fontWeight: '600' },
    dividerLine:      { background: 'rgba(94,139,113,0.15)' },
    dividerText:      { color: '#9EADA1' },
  },
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-7 w-full">
      {/* Brand mark */}
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-[18px] flex items-center justify-center text-white font-black text-[22px] mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, #4A7A5F 0%, #5E8B71 100%)',
            boxShadow:  '0 10px 28px rgba(74,122,95,0.42)',
          }}
        >
          S
        </div>
        <h1 className="text-[26px] font-black leading-tight mb-1" style={{ color: '#1A2B1E' }}>
          stable.
        </h1>
        <p className="text-sm" style={{ color: '#7A9A82' }}>
          Start your journey to calmer focus
        </p>
      </div>

      {/* Clerk — renders its own card, styled above */}
      <div className="w-full min-w-0">
        <SignUp fallbackRedirectUrl="/dashboard" appearance={appearance} />
      </div>
    </div>
  )
}
