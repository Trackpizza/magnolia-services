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
/** token → session, one sign-in per patient page (10-02). The single key
 *  above meant signing in to a second page on the same device (a parent with
 *  two children, the clinic testing several charts) silently signed the first
 *  one out: its stored session now belonged to another chart, and the server
 *  rightly answered "locked". Read as a fallback only, so a device signed in
 *  before this change is not asked for a code again. */
const SESSIONS_KEY = 'msc_portal_sessions'

function readMap(): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '{}')
    return v && typeof v === 'object' ? (v as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/** This page's sign-in on this device, or '' to ask for a code. */
export function readSession(token: string): string {
  const own = readMap()[token]
  if (own) return own
  try {
    return localStorage.getItem(SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Forget this page's sign-in on this device — and the old single key too
 *  when it holds this same sign-in, or the fallback would sign them back in. */
export function forgetSession(token: string) {
  const s = readSession(token)
  writeSession(token, '')
  try {
    if (s && localStorage.getItem(SESSION_KEY) === s) localStorage.removeItem(SESSION_KEY)
  } catch {
    /* nothing to forget */
  }
}

/** Remember (or, with '', forget) this page's sign-in on this device. */
export function writeSession(token: string, v: string) {
  try {
    const m = readMap()
    if (v) m[token] = v
    else delete m[token]
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(m))
  } catch {
    /* It just asks for a code again next time. */
  }
}

/** Every sign-in held on this device — for a page that is not the portal
 *  (the follow-up photo link) to ask whether any of them opens this chart. */
export function allSessions(): string[] {
  const out = new Set(Object.values(readMap()).filter(Boolean))
  try {
    const legacy = localStorage.getItem(SESSION_KEY)
    if (legacy) out.add(legacy)
  } catch {
    /* none */
  }
  return Array.from(out)
}
