import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'linear-gradient(135deg, #3D6B54 0%, #4A7A5F 50%, #5E8B71 100%)',
          borderRadius:   '7px',
        }}
      >
        <span
          style={{
            color:       'rgba(255,255,255,0.95)',
            fontSize:    '21px',
            fontWeight:  900,
            fontFamily:  'sans-serif',
            lineHeight:  1,
          }}
        >
          S
        </span>
      </div>
    ),
    size,
  )
}
