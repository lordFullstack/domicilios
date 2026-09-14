type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error'

const patterns: Record<HapticPattern, number | number[]> = {
  light:   10,
  medium:  20,
  heavy:   40,
  success: [10, 50, 10],
  error:   [50, 30, 50],
}

export function haptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return
  try {
    navigator.vibrate(patterns[pattern])
  } catch {
    // silencioso
  }
}