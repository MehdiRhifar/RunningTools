import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'installPromptDismissed'

// Événement non standard (Chrome, Edge, Android) : absent des types DOM
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  // iPadOS se présente comme un Mac, d'où le test sur les points tactiles
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // Stockage indisponible (navigation privée) : le message reviendra
  }
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const ios = isIos()

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return

    // iOS n'a pas d'événement d'installation : on explique le geste à faire
    if (ios) {
      setVisible(true)
      return
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault() // Empêche la mini-barre native, on affiche la nôtre
      setInstallEvent(event as BeforeInstallPromptEvent)
      setVisible(true)
    }
    const onInstalled = () => setVisible(false)

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [ios])

  const dismiss = () => {
    rememberDismissed()
    setVisible(false)
  }

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Installer l'application"
      className="install-prompt"
      style={{
        position: 'fixed',
        left: '1em',
        right: '1em',
        bottom: '1em',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '0.8em 1em',
        borderRadius: '10px',
        background: '#232323',
        boxShadow: '0 1px 2px 2px rgba(0, 0, 0, 0.5)',
        border: '1px solid #555',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8em',
        fontSize: '0.9em',
      }}
    >
      <p style={{ margin: 0, flex: 1 }}>
        {ios
          ? "Installer Running Tools : appuyer sur Partager, puis « Sur l'écran d'accueil »."
          : "Installer Running Tools sur l'écran d'accueil pour y accéder plus vite, même hors ligne."}
      </p>
      {!ios && (
        <button type="button" onClick={install} style={{ whiteSpace: 'nowrap' }}>
          Installer
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        style={{ padding: '0.3em 0.7em' }}
      >
        ✕
      </button>
    </div>
  )
}
