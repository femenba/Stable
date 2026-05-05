import type { TaskCategory } from '@stable/shared'

export const theme = {
  light: {
    bg:         '#F6F5FF',
    card:       '#FFFFFF',
    cardBorder: '#ECEAFF',
    nav:        '#FFFFFF',
    navBorder:  '#ECEAFF',
    t1:         '#1C1A3A',
    t2:         '#6B688A',
    t3:         '#C0BDDA',
    headerStart: '#5B4FCE',
    headerMid:   '#7260D8',
    headerEnd:   '#8E74DA',
    ctaStart:    '#6366F1',
    ctaEnd:      '#818CF8',
  },
  dark: {
    bg:         '#0F0D20',
    card:       '#1A1733',
    cardBorder: '#2D2855',
    nav:        '#0F0D20',
    navBorder:  '#1E1B38',
    t1:         '#E8E4F7',
    t2:         '#9490B8',
    t3:         '#3D3868',
    headerStart: '#1E1260',
    headerMid:   '#130F28',
    headerEnd:   '#0F0D20',
    ctaStart:    '#6366F1',
    ctaEnd:      '#A78BFA',
  },
} as const

export type Theme = typeof theme.light

export const catColor: Record<TaskCategory, { light: string; dark: string }> = {
  work:     { light: '#6366F1', dark: '#818CF8' },
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
