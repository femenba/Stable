import type { TaskCategory } from '@stable/shared'

export const theme = {
  light: {
    bg:          '#F8F7F2',
    card:        '#FFFFFF',
    cardBorder:  'rgba(94,139,113,0.14)',
    nav:         '#FFFFFF',
    navBorder:   'rgba(94,139,113,0.12)',
    t1:          '#1E1D2E',
    t2:          '#6B6880',
    t3:          '#B0ADC5',
    headerStart: '#3D6B54',
    headerMid:   '#5E8B71',
    headerEnd:   '#7BA68A',
    ctaStart:    '#5E8B71',
    ctaEnd:      '#7BA68A',
  },
  dark: {
    bg:          '#13120E',
    card:        '#1E1C17',
    cardBorder:  'rgba(94,139,113,0.15)',
    nav:         '#13120E',
    navBorder:   '#26241A',
    t1:          '#F2EEE4',
    t2:          '#9B9A8E',
    t3:          '#454035',
    headerStart: '#1A2E22',
    headerMid:   '#162018',
    headerEnd:   '#131E18',
    ctaStart:    '#5E8B71',
    ctaEnd:      '#7BA68A',
  },
} as const

export type Theme = typeof theme.light

export const catColor: Record<TaskCategory, { light: string; dark: string }> = {
  work:     { light: '#5E8B71', dark: '#7BA68A' },
  personal: { light: '#8B7EC8', dark: '#A095D4' },
  family:   { light: '#D9607A', dark: '#E89EAD' },
  health:   { light: '#5BA4C8', dark: '#70B5D5' },
  other:    { light: '#8B9BA8', dark: '#9BA8B4' },
}

export const catLabel: Record<TaskCategory, string> = {
  work:     'Work',
  personal: 'Personal',
  family:   'Family',
  health:   'Health',
  other:    'Other',
}
