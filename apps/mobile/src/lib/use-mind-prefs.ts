// apps/mobile/src/lib/use-mind-prefs.ts
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'stable:mind-prefs'

export type MindThemeKey    = 'minimal' | 'night' | 'forest' | 'ocean'
export type MindLayoutKey   = 'cards' | 'scroll' | 'tabs'
export type BreathStyleKey  = 'circle' | 'countdown' | 'arc' | 'blob'

export type MindPrefs = {
  theme:                  MindThemeKey
  layout:                 MindLayoutKey
  breathStyle:            BreathStyleKey
  reminderTime:           { hour: number; minute: number } | null
  reminderNotificationId: string | null
}

const DEFAULTS: MindPrefs = {
  theme:                  'minimal',
  layout:                 'cards',
  breathStyle:            'circle',
  reminderTime:           null,
  reminderNotificationId: null,
}

export function useMindPrefs() {
  const [prefs, setPrefs] = useState<MindPrefs>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULTS, ...JSON.parse(raw) })
        } catch {
          // corrupt data — use defaults
        }
      }
      setLoaded(true)
    })
  }, [])

  const updatePrefs = useCallback((patch: Partial<MindPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      AsyncStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { prefs, updatePrefs, loaded }
}
