import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  type ViewStyle, type TextStyle, type TextInputProps,
} from 'react-native'
import type { ReactNode } from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────

type CardProps = {
  children:  ReactNode
  style?:    ViewStyle
  onPress?:  () => void
  padding?:  number
}

export function Card({ children, style, onPress, padding = 20 }: CardProps) {
  const Inner = (
    <View style={[card.base, { padding }, style]}>
      {children}
    </View>
  )
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {Inner}
      </TouchableOpacity>
    )
  }
  return Inner
}

const card = StyleSheet.create({
  base: {
    borderRadius:    24,
    backgroundColor: '#FFFFFF',
    borderWidth:     1,
    borderColor:     'rgba(94,139,113,0.14)',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    12,
    elevation:       3,
  },
})

// ── Btn ───────────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'ghost' | 'tonal' | 'glass'
type BtnSize    = 'sm' | 'md' | 'lg'

type BtnProps = {
  children:  ReactNode
  variant?:  BtnVariant
  size?:     BtnSize
  full?:     boolean
  onPress?:  () => void
  disabled?: boolean
  style?:    ViewStyle
  textStyle?: TextStyle
}

const BV: Record<BtnVariant, ViewStyle> = {
  primary: { backgroundColor: '#5E8B71', shadowColor: '#5E8B71', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 14, elevation: 6 },
  ghost:   { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(94,139,113,0.18)' },
  tonal:   { backgroundColor: 'rgba(94,139,113,0.12)' },
  glass:   { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
}

const BTC: Record<BtnVariant, string> = {
  primary: '#FFFFFF',
  ghost:   '#5E8B71',
  tonal:   '#5E8B71',
  glass:   '#FFFFFF',
}

const BS: Record<BtnSize, { py: number; px: number; fs: number }> = {
  sm: { py: 10, px: 18, fs: 13 },
  md: { py: 14, px: 24, fs: 15 },
  lg: { py: 18, px: 32, fs: 17 },
}

export function Btn({ children, variant = 'primary', size = 'md', full, onPress, disabled, style, textStyle }: BtnProps) {
  const s = BS[size]
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
      style={[
        { borderRadius: 100, alignItems: 'center', justifyContent: 'center', paddingVertical: s.py, paddingHorizontal: s.px },
        BV[variant],
        full && { width: '100%' },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={[{ fontSize: s.fs, fontWeight: '800', color: BTC[variant], letterSpacing: 0.1 }, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────

export function Label({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return (
    <Text style={[{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, color: '#B0ADC5' }, style]}>
      {children}
    </Text>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

export function SectionHeader({
  label, action, onAction,
}: { label: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Label>{label}</Label>
      {action && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#5E8B71' }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

type InputProps = TextInputProps & { containerStyle?: ViewStyle }

export function StableInput({ containerStyle, style, ...rest }: InputProps) {
  return (
    <TextInput
      style={[{
        borderRadius:    16,
        borderWidth:     1,
        borderColor:     'rgba(94,139,113,0.18)',
        backgroundColor: '#F8F7F2',
        paddingHorizontal: 16,
        paddingVertical:   12,
        fontSize:          15,
        fontWeight:        '500',
        color:             '#1E1D2E',
      }, style]}
      placeholderTextColor="#B0ADC5"
      {...rest}
    />
  )
}
