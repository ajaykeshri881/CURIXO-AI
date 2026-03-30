const RENDER_HEALTH_URL = 'https://curixoai.onrender.com/api/health'
const HEALTH_PING_STORAGE_KEY = 'curixo:last-health-ping-at'
const HEALTH_PING_INTERVAL_MS = 10 * 60 * 1000
const HEALTH_CHECK_TICK_MS = 60 * 1000

function getLastHealthPingAt() {
  const storedValue = window.localStorage.getItem(HEALTH_PING_STORAGE_KEY)
  const parsedValue = Number(storedValue)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function setLastHealthPingAt(timestamp) {
  window.localStorage.setItem(HEALTH_PING_STORAGE_KEY, String(timestamp))
}

function runRenderHealthCheck(force = false) {
  const now = Date.now()
  let lastPingAt = 0

  try {
    lastPingAt = getLastHealthPingAt()
  } catch {
    lastPingAt = 0
  }

  if (!force && now - lastPingAt < HEALTH_PING_INTERVAL_MS) {
    return
  }

  try {
    setLastHealthPingAt(now)
  } catch {
    // If localStorage is unavailable, still send the warm-up ping.
  }

  void fetch(RENDER_HEALTH_URL, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-store',
    keepalive: true,
  }).catch(() => {
    // Ignore warm-up failures; app functionality should not depend on this ping.
  })
}

export function startRenderHealthWarmup() {
  if (!import.meta.env.PROD) {
    return
  }

  const checkHealthWhenActive = () => {
    if (document.visibilityState === 'visible') {
      runRenderHealthCheck()
    }
  }

  // Always ping once when the website opens.
  runRenderHealthCheck(true)

  // Keep the backend awake while user remains on the website.
  const healthCheckIntervalId = window.setInterval(checkHealthWhenActive, HEALTH_CHECK_TICK_MS)

  const cleanup = () => {
    window.clearInterval(healthCheckIntervalId)
    window.removeEventListener('focus', checkHealthWhenActive)
    document.removeEventListener('visibilitychange', checkHealthWhenActive)
    window.removeEventListener('beforeunload', cleanup)
  }

  window.addEventListener('focus', checkHealthWhenActive)
  document.addEventListener('visibilitychange', checkHealthWhenActive)
  window.addEventListener('beforeunload', cleanup)
}
