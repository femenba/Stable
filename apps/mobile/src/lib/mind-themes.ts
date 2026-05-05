// apps/mobile/src/lib/mind-themes.ts
export type MindTheme = {
  bg:         string
  card:       string
  accent:     string
  accentSoft: string
  t1:         string
  t2:         string
  t3:         string
  gradientStart: string
  gradientEnd:   string
}

export const MIND_THEMES: Record<string, MindTheme> = {
  minimal: {
    bg:            '#F8F7F2',
    card:          '#FFFFFF',
    accent:        '#5E8B71',
    accentSoft:    'rgba(94,139,113,0.1)',
    t1:            '#1E1D2E',
    t2:            '#6B6880',
    t3:            '#B0ADC5',
    gradientStart: '#3D6B54',
    gradientEnd:   '#5E8B71',
  },
  night: {
    bg:            '#13120E',
    card:          '#1E1C17',
    accent:        '#7BA68A',
    accentSoft:    'rgba(94,139,113,0.15)',
    t1:            '#F2EEE4',
    t2:            '#9B9A8E',
    t3:            '#454035',
    gradientStart: '#1A2E22',
    gradientEnd:   '#13120E',
  },
  forest: {
    bg:            '#F0FAF2',
    card:          '#FFFFFF',
    accent:        '#16A34A',
    accentSoft:    'rgba(22,163,74,0.08)',
    t1:            '#14532D',
    t2:            '#166534',
    t3:            '#BBF7D0',
    gradientStart: '#15803D',
    gradientEnd:   '#166534',
  },
  ocean: {
    bg:            '#F0F8FF',
    card:          '#FFFFFF',
    accent:        '#0891B2',
    accentSoft:    'rgba(8,145,178,0.08)',
    t1:            '#0C4A6E',
    t2:            '#075985',
    t3:            '#BAE6FD',
    gradientStart: '#0369A1',
    gradientEnd:   '#0891B2',
  },
}
