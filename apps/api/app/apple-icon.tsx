import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'linear-gradient(145deg, #3D6B54 0%, #4A7A5F 40%, #5E8B71 100%)',
        }}
      >
        <span
          style={{
            color:          'rgba(255,255,255,0.95)',
            fontSize:       '115px',
            fontWeight:     900,
            fontFamily:     'sans-serif',
            lineHeight:     1,
            letterSpacing:  '-3px',
          }}
        >
          S
        </span>
      </div>
    ),
    size,
  )
}
