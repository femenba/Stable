import type { TaskCategory } from '@stable/shared'

export const theme = {
  light: {
    bg:         '#fafafe',
    card:       '#ffffff',
    cardBorder: '#f0eeff',
    nav:        '#ffffff',
    navBorder:  '#f0eeff',
    t1:         '#111111',
    t2:         '#888888',
    t3:         '#cccccc',
    headerStart: '#4f3aff',
    headerMid:   '#7c3aed',
    headerEnd:   '#c026d3',
    ctaStart:    '#4f3aff',
    ctaEnd:      '#7c3aed',
  },
  dark: {
    bg:         '#120e24',
    card:       '#1a1535',
    cardBorder: '#2a1f60',
    nav:        '#120e24',
    navBorder:  '#1e1a38',
    t1:         '#e2d9f3',
    t2:         '#8b7ab8',
    t3:         '#3a2f5a',
    headerStart: '#1e1260',
    headerMid:   '#120e24',
    headerEnd:   '#120e24',
    ctaStart:    '#6366f1',
    ctaEnd:      '#a855f7',
  },
} as const

export type Theme = typeof theme.light

export const catColor: Record<TaskCategory, { light: string; dark: string }> = {
  work:     { light: '#4f3aff', dark: '#6366f1' },
  personal: { light: '#7c3aed', dark: '#a855f7' },
  family:   { light: '#be185d', dark: '#ec4899' },
  health:   { light: '#0891b2', dark: '#22d3ee' },
  other:    { light: '#6b7280', dark: '#9ca3af' },
}

export const catLabel: Record<TaskCategory, string> = {
  work:     'Work',
  personal: 'Personal',
  family:   'Family',
  health:   'Health',
  other:    'Other',
}
