// Utilidades para el sonido de la campanita y el permiso de notificaciones
// del navegador. Los navegadores bloquean audio y notificaciones hasta que
// el usuario interactúa y/o da permiso explícito — por eso todo esto existe.

let audioContext: AudioContext | null = null
let audioUnlocked = false

// Llamar esto en la PRIMERA interacción del usuario en toda la app
// (un clic, un toque). Sin esto, el navegador bloquea el sonido.
export const unlockNotificationAudio = () => {
  if (audioUnlocked) return
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioUnlocked = true
  } catch {
    // Si el navegador no soporta Web Audio, simplemente no habrá sonido
  }
}

// Beep de dos tonos, generado en el momento (no necesita ningún archivo
// de audio que descargar ni licenciar).
export const playNotificationSound = () => {
  if (!audioContext) return
  const now = audioContext.currentTime

  const playTone = (freq: number, start: number, duration: number) => {
    const osc = audioContext!.createOscillator()
    const gain = audioContext!.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + start)
    gain.gain.linearRampToValueAtTime(0.15, now + start + 0.01)
    gain.gain.linearRampToValueAtTime(0, now + start + duration)
    osc.connect(gain)
    gain.connect(audioContext!.destination)
    osc.start(now + start)
    osc.stop(now + start + duration)
  }

  playTone(880, 0, 0.12)
  playTone(1320, 0.12, 0.15)
}

// Permiso de notificaciones del navegador (distinto del audio). Se debe
// pedir en respuesta a una acción del usuario (ej: abrir la campanita
// por primera vez), nunca solo al cargar la página.
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

export const showBrowserNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return // ya lo ve en la campanita
  new Notification(title, { body })
}
