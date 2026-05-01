import { useColorScheme } from 'react-native'
import { theme, catColor, catLabel } from './theme'
import type { TaskCategory } from '@stable/shared'

export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const t = isDark ? theme.dark : theme.light

  function getCatColor(category: TaskCategory): string {
    return isDark ? catColor[category].dark : catColor[category].light
  }

  return { t, isDark, getCatColor, catLabel }
}
