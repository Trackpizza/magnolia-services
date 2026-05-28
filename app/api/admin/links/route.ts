import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('serviceLinks').doc('config').get()
  return NextResponse.json(snap.exists ? snap.data() : {})
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await adminDb.collection('serviceLinks').doc('config').set(body, { merge: true })

  // Trigger revalidation so ISR pages rebuild
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-token': process.env.ADMIN_PASSWORD ?? '' },
    })
  } catch { /* revalidation is best-effort */ }

  return NextResponse.json({ success: true })
}
