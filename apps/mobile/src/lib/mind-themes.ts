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
    bg:            '#fafafe',
    card:          '#ffffff',
    accent:        '#4f3aff',
    accentSoft:    'rgba(79,58,255,0.08)',
    t1:            '#111111',
    t2:            '#888888',
    t3:            '#cccccc',
    gradientStart: '#4f3aff',
    gradientEnd:   '#7c3aed',
  },
  night: {
    bg:            '#0d0d1a',
    card:          '#1a1535',
    accent:        '#6366f1',
    accentSoft:    'rgba(99,102,241,0.15)',
    t1:            '#e2d9f3',
    t2:            '#8b7ab8',
    t3:            '#3a2f5a',
    gradientStart: '#1e1260',
    gradientEnd:   '#0d0d1a',
  },
  forest: {
    bg:            '#f0faf0',
    card:          '#ffffff',
    accent:        '#16a34a',
    accentSoft:    'rgba(22,163,74,0.08)',
    t1:            '#14532d',
    t2:            '#166534',
    t3:            '#bbf7d0',
    gradientStart: '#15803d',
    gradientEnd:   '#166534',
  },
  ocean: {
    bg:            '#f0f8ff',
    card:          '#ffffff',
    accent:        '#0891b2',
    accentSoft:    'rgba(8,145,178,0.08)',
    t1:            '#0c4a6e',
    t2:            '#075985',
    t3:            '#bae6fd',
    gradientStart: '#0369a1',
    gradientEnd:   '#0891b2',
  },
}
