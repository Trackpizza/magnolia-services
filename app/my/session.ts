/**
 * Where the 90-day portal login lives on this device.
 *
 * localStorage, per browser, and it is only a KEY — the server decides what it
 * opens and which patient it belongs to, so a stolen one is worth nothing on
 * anyone else's link. Wrapped because a private window, blocked site data or a
 * thumbnail capture makes these throw rather than return empty, and a portal
 * that white-screens because storage said no is worse than one that asks for a
 * code again.
 *
 * Shared by the portal and by Find your page, which logs somebody in before
 * the portal has rendered at all.
 */
const SESSION_KEY = 'msc_portal_session'

export function readSession(): string {
  try {
    return localStorage.getItem(SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

export function writeSession(v: string) {
  try {
    localStorage.setItem(SESSION_KEY, v)
  } catch {
    /* It just asks for a code again next time. */
  }
}
