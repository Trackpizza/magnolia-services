import { NextResponse } from 'next/server'

// TEMPORARY diagnostic — remove after debugging admin login.
// Never returns the secret value, only presence/shape.
export const dynamic = 'force-dynamic'

export async function GET() {
  const v = process.env.ADMIN_PASSWORD
  return NextResponse.json({
    adminPasswordDefined: v !== undefined,
    length: v ? v.length : 0,
    firstCode: v ? v.charCodeAt(0) : null,
    lastCode: v ? v.charCodeAt(v.length - 1) : null,
    firebaseProjectIdDefined: process.env.FIREBASE_PROJECT_ID !== undefined,
  })
}
