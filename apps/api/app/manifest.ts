import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'stable.',
    short_name:       'stable.',
    description:      'Your focus & wellbeing companion',
    start_url:        '/dashboard',
    display:          'standalone',
    orientation:      'portrait',
    background_color: '#F3F6F3',
    theme_color:      '#4A7A5F',
    icons: [
      {
        src:     '/apple-icon',
        sizes:   '180x180',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/apple-icon',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/apple-icon',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
