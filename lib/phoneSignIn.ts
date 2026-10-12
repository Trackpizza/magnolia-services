'use client'
/**
 * Texted login codes through Google (Firebase phone sign-in) instead of
 * Twilio (10-12, Eric: Twilio Verify was 5¢ a login). Same approach as the
 * photo consult (visage-clinical src/lib/phoneVerify.ts).
 *
 * Runs against the RECORDS project (medspa-reports), on its own named app
 * instance, so the code is sent and proved under the project the Google Cloud
 * BAA covers — this site never sees the number or the code. The browser gets
 * an ID token and hands it to the records API, which checks the number Google
 * proved against the chart and deletes the temporary Firebase user
 * (records lib/phoneToken.ts).
 *
 * The patient types their mobile. Where the page knows the chart's last four
 * digits, it checks them before sending, so a typo never texts a stranger.
 */
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut,
  type Auth, type ConfirmationResult,
} from 'firebase/auth'

const APP_NAME = 'records-phone'
const config = {
  apiKey: process.env.NEXT_PUBLIC_RECORDS_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_RECORDS_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_RECORDS_FIREBASE_PROJECT_ID,
}

export const phoneSignInConfigured = !!config.apiKey && !!config.projectId

function auth(): Auth {
  const app: FirebaseApp = getApps().some((a) => a.name === APP_NAME) ? getApp(APP_NAME) : initializeApp(config, APP_NAME)
  return getAuth(app)
}

/** "(818) 555-0142" → "+18185550142"; '' for anything else. US only, on
 *  purpose: this decides where a text goes (the project's SMS region policy is
 *  the control that cannot be bypassed). */
export function toE164(raw: string): string {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1)
  return d.length === 10 ? `+1${d}` : ''
}

let verifier: RecaptchaVerifier | null = null

function resetVerifier() {
  try { verifier?.clear() } catch { /* already gone */ }
  verifier = null
}

/** Only the invisible "not a robot" check (10-12, one-tap portal and photo
 *  page): its token goes to the records server, which texts the number ON THE
 *  CHART itself (records lib/googleSms.ts) — so the patient types nothing and
 *  the number never comes to the browser. */
export async function robotCheckToken(containerId: string): Promise<string> {
  if (!phoneSignInConfigured) throw new Error('Text codes are not available just now. Please use email, or call us.')
  resetVerifier()
  try {
    verifier = new RecaptchaVerifier(auth(), containerId, { size: 'invisible' })
    const token = await verifier.verify()
    resetVerifier()
    return token
  } catch (e) {
    resetVerifier()
    throw new Error(friendlyError(e))
  }
}

/** Text a code. `containerId`: an empty element on the page for the invisible
 *  "not a robot" check. */
export async function sendPhoneCode(phone: string, containerId: string): Promise<ConfirmationResult> {
  const e164 = toE164(phone)
  if (!e164) throw new Error('Please enter a 10-digit US mobile number.')
  if (!phoneSignInConfigured) throw new Error('Text codes are not available just now. Please use email, or call us.')
  resetVerifier()
  try {
    verifier = new RecaptchaVerifier(auth(), containerId, { size: 'invisible' })
    return await signInWithPhoneNumber(auth(), e164, verifier)
  } catch (e) {
    resetVerifier()
    throw new Error(friendlyError(e))
  }
}

/** The code they typed → a one-time proof for the records API. Signs the
 *  temporary user straight back out of this browser. */
export async function confirmPhoneCode(confirmation: ConfirmationResult, code: string): Promise<string> {
  try {
    const cred = await confirmation.confirm(code.replace(/\D/g, ''))
    const token = await cred.user.getIdToken()
    await signOut(auth()).catch(() => undefined)
    resetVerifier()
    return token
  } catch (e) {
    throw new Error(friendlyError(e))
  }
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code || ''
  if (code === 'auth/invalid-phone-number') return 'That phone number doesn’t look right. Check the digits.'
  if (code === 'auth/invalid-verification-code') return 'That code didn’t match. Check it and try again.'
  if (code === 'auth/code-expired') return 'That code has expired. Send a new one.'
  if (code === 'auth/too-many-requests') return 'Too many attempts from this device. Wait a few minutes and try again, or use email.'
  if (code === 'auth/quota-exceeded') return 'Text codes are paused for today. Please use email, or call or text us.'
  if (code === 'auth/captcha-check-failed' || code === 'auth/missing-app-credential') return 'The text could not start on this page. Reload and try again.'
  if (code === 'auth/unsupported-first-factor' || code === 'auth/operation-not-allowed') return 'Text codes aren’t available for that number. Please use email, or call us.'
  const msg = (e as { message?: string })?.message
  return msg && !msg.startsWith('Firebase') ? msg : 'We could not text a code just now. Please try again, or use email.'
}
