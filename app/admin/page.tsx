'use client'
import { useState, useEffect } from 'react'
import type { ServiceLinks } from '@/lib/types'
import { DEFAULT_LINKS } from '@/lib/types'

const SERVICE_SLUGS: Array<{ slug: string; name: string }> = [
  { slug: 'agnes-rf-microneedling', name: 'Agnes RF Microneedling' },
  { slug: 'agnes-rf-eye-bag-treatment', name: 'Agnes RF Eye Bag Treatment' },
  { slug: 'agnes-rf-acne-scar-treatment', name: 'Agnes RF Acne & Scar Treatment' },
  { slug: 'agnes-rf-non-surgical-facelift', name: 'Agnes RF Non-Surgical Facelift' },
  { slug: 'scarlet-pro-srf-microneedling', name: 'Scarlet PRO SRF Microneedling' },
  { slug: 'scarlet-srf-body-tightening', name: 'Scarlet SRF Body Tightening' },
  { slug: 'nouvaderm-laser-resurfacing', name: 'NOUVADerm Laser Resurfacing' },
  { slug: 'nouvaderm-laser-rosacea', name: 'NOUVADerm Laser for Rosacea' },
  { slug: 'nouvaderm-scalp-laser', name: 'NOUVADerm Scalp Laser Treatment' },
  { slug: 'plasmage-skin-tightening', name: 'Plasmage Plasma Skin Tightening' },
  { slug: 'plasmage-eyelid-lift', name: 'Plasmage Eyelid & Eye Bag Lift' },
  { slug: 'plasmage-scar-removal', name: 'Plasmage Scar & Skin Tag Removal' },
  { slug: 'cellenis-derma-prp', name: 'Cellenis Derma PRP' },
  { slug: 'prp-hair-restoration', name: 'PRP Hair Restoration' },
  { slug: 'prp-microneedling-facial', name: 'PRP Microneedling Facial' },
  { slug: 'aquafirme-xs-hair-restoration', name: 'AquaFirme XS Hair Restoration' },
  { slug: 'derive-scalp-serum', name: 'Dérives Scalp Serum' },
  { slug: 'daxxify', name: 'Daxxify' },
  { slug: 'jeuveau', name: 'Jeuveau' },
  { slug: 'xeomin', name: 'Xeomin' },
  { slug: 'revanesse-versa', name: 'Revanesse Versa+' },
  { slug: 'revanesse-lip', name: 'Revanesse Lip' },
  { slug: 'prx-derm-perfexion', name: 'PRX Derm Perfexion' },
  { slug: 'prx-plus-brightening', name: 'PRX Plus Brightening Peel' },
  { slug: 'sensi-peel', name: 'Sensi Peel' },
  { slug: 'ultra-peel', name: 'Ultra Peel' },
  { slug: 'pigment-peel', name: 'Pigment Peel' },
  { slug: 'b-complex-injection', name: 'B-Complex Injection' },
  { slug: 'glutathione-injection', name: 'Glutathione Injection' },
  { slug: 'mic-blend-injection', name: 'MIC Blend Injection' },
  { slug: 'lipotropic-plus', name: 'Lipotropic Plus' },
  { slug: 'ultraburn-injection', name: 'UltraBurn Injection' },
  { slug: 'ic-lipolean', name: 'IC LipoLean' },
  { slug: 'bpc-157', name: 'BPC-157' },
  { slug: 'ghk-cu-copper-peptide', name: 'GHK-Cu Copper Peptide' },
  { slug: 'sermorelin', name: 'Sermorelin' },
  { slug: 'nad-therapy', name: 'NAD+ Therapy' },
  { slug: 'weight-loss-consultation', name: 'Weight Loss Consultation' },
  { slug: 'weight-loss-program', name: 'Medical Weight Loss Program' },
  { slug: 'cherry-payment-plans', name: 'Cherry Payment Plans' },
]

function Input({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [links, setLinks] = useState<ServiceLinks>(DEFAULT_LINKS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('svc_admin_token')
    if (stored) { setAuthed(true); loadLinks(stored) }
  }, [])

  const handleLogin = async () => {
    setAuthError('')
    const res = await fetch('/api/admin/links', { headers: { 'x-admin-token': password } })
    if (res.ok) {
      sessionStorage.setItem('svc_admin_token', password)
      setAuthed(true)
      const data = await res.json()
      setLinks(prev => ({
        mainFooter: { ...prev.mainFooter, ...(data.mainFooter ?? {}) },
        serviceFooter: { ...prev.serviceFooter, ...(data.serviceFooter ?? {}) },
        videos: data.videos ?? {},
        content: data.content ?? {},
      }))
    } else {
      setAuthError('Incorrect password')
    }
  }

  const loadLinks = async (token: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/links', { headers: { 'x-admin-token': token } })
    if (res.ok) {
      const data = await res.json()
      setLinks(prev => ({
        mainFooter: { ...prev.mainFooter, ...(data.mainFooter ?? {}) },
        serviceFooter: { ...prev.serviceFooter, ...(data.serviceFooter ?? {}) },
        videos: data.videos ?? {},
        content: data.content ?? {},
      }))
    }
    setLoading(false)
  }

  const save = async (section: string, payload: Partial<ServiceLinks>) => {
    const token = sessionStorage.getItem('svc_admin_token') ?? ''
    setSaving(section)
    const res = await fetch('/api/admin/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(payload),
    })
    setSaving(null)
    if (res.ok) { setSaved(section); setTimeout(() => setSaved(null), 2500) }
  }

  const updateMainFooter = (key: keyof ServiceLinks['mainFooter'], val: string) =>
    setLinks(l => ({ ...l, mainFooter: { ...l.mainFooter, [key]: val } }))

  const updateServiceFooter = (key: keyof ServiceLinks['serviceFooter'], val: string) =>
    setLinks(l => ({ ...l, serviceFooter: { ...l.serviceFooter, [key]: val } }))

  const updateVideo = (slug: string, url: string) =>
    setLinks(l => ({ ...l, videos: { ...l.videos, [slug]: url } }))

  const updateContent = (slug: string, md: string) =>
    setLinks(l => ({ ...l, content: { ...l.content, [slug]: md } }))

  // ── Login screen ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Services Admin</h1>
          <p className="text-sm text-gray-500 mb-6">Magnolia Skin Center</p>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="animate-spin w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const SaveButton = ({ section, onClick }: { section: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={saving === section}
      className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
    >
      {saving === section ? 'Saving…' : saved === section ? '✓ Saved' : 'Save'}
    </button>
  )

  // ── Admin UI ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold">Services Admin</h1>
          <p className="text-white/50 text-xs">Magnolia Skin Center</p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('svc_admin_token'); setAuthed(false) }}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* ── Main Page Footer ─────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Main Services Page Footer</h2>
              <p className="text-sm text-gray-500 mt-0.5">Links shown at the bottom of the services directory page</p>
            </div>
            <SaveButton section="main" onClick={() => save('main', { mainFooter: links.mainFooter })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Address" value={links.mainFooter.address} onChange={v => updateMainFooter('address', v)} placeholder="3506½ W Magnolia Blvd, Burbank, CA 91505" />
            </div>
            <Input label="Phone" value={links.mainFooter.phone} onChange={v => updateMainFooter('phone', v)} placeholder="(747) 305-8973" />
            <Input label="Email" value={links.mainFooter.email} onChange={v => updateMainFooter('email', v)} placeholder="hello@magnoliaskincenter.com" />
            <Input label="Booking / Consultation URL" value={links.mainFooter.bookingUrl} onChange={v => updateMainFooter('bookingUrl', v)} placeholder="https://..." hint="The 'Book a Complimentary Call' button" />
            <Input label="Membership Site URL" value={links.mainFooter.membershipUrl} onChange={v => updateMainFooter('membershipUrl', v)} placeholder="https://membership.magnoliaskincenter.com" hint="Where 'View Memberships' links to" />
            <Input label="Main Website URL" value={links.mainFooter.websiteUrl} onChange={v => updateMainFooter('websiteUrl', v)} placeholder="https://www.magnoliaskincenter.com" />
            <Input label="Instagram URL" value={links.mainFooter.instagramUrl} onChange={v => updateMainFooter('instagramUrl', v)} placeholder="https://instagram.com/..." />
            <Input label="Facebook URL" value={links.mainFooter.facebookUrl} onChange={v => updateMainFooter('facebookUrl', v)} placeholder="https://facebook.com/..." />
          </div>
        </section>

        {/* ── Service Detail Page Footer ──────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Service Detail Page Footer</h2>
              <p className="text-sm text-gray-500 mt-0.5">CTA links shown at the bottom of every individual service page</p>
            </div>
            <SaveButton section="service" onClick={() => save('service', { serviceFooter: links.serviceFooter })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Booking / Consultation URL" value={links.serviceFooter.bookingUrl} onChange={v => updateServiceFooter('bookingUrl', v)} placeholder="https://..." hint="'Book a Complimentary 15 Minute Video Call' button" />
            <Input label="Membership Site URL" value={links.serviceFooter.membershipUrl} onChange={v => updateServiceFooter('membershipUrl', v)} placeholder="https://membership.magnoliaskincenter.com" hint="'View Memberships' button" />
            <Input label="Phone" value={links.serviceFooter.phone} onChange={v => updateServiceFooter('phone', v)} placeholder="(747) 305-8973" />
          </div>
        </section>

        {/* ── Video URLs ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Service Video URLs</h2>
              <p className="text-sm text-gray-500 mt-0.5">Paste a YouTube URL to replace the video placeholder on that service page. Leave blank to keep the placeholder.</p>
            </div>
            <SaveButton section="videos" onClick={() => save('videos', { videos: links.videos })} />
          </div>
          <p className="text-xs text-gray-400 mb-5">Accepts full YouTube URL (e.g. https://youtube.com/watch?v=...) or short link (https://youtu.be/...)</p>
          <div className="space-y-3">
            {SERVICE_SLUGS.map(({ slug, name }) => (
              <div key={slug} className="grid grid-cols-5 gap-3 items-center">
                <label className="col-span-2 text-sm text-gray-700 font-medium leading-tight">{name}</label>
                <input
                  type="text"
                  value={links.videos[slug] ?? ''}
                  onChange={e => updateVideo(slug, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton section="videos" onClick={() => save('videos', { videos: links.videos })} />
          </div>
        </section>

        {/* ── Page Content (Markdown) ─────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Page Content</h2>
              <p className="text-sm text-gray-500 mt-0.5">Extra text shown directly under the &ldquo;How it works&rdquo; box on each service page. Leave blank to hide.</p>
            </div>
            <SaveButton section="content" onClick={() => save('content', { content: links.content })} />
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Supports Markdown: <code className="text-gray-500">## Heading</code>, <code className="text-gray-500">**bold**</code>, <code className="text-gray-500">*italic*</code>, <code className="text-gray-500">- bullet</code>, <code className="text-gray-500">[link](https://...)</code>, <code className="text-gray-500">&gt; quote</code>. Single line breaks are preserved.
          </p>
          <div className="space-y-6">
            {SERVICE_SLUGS.map(({ slug, name }) => (
              <div key={slug}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{name}</label>
                <textarea
                  value={links.content[slug] ?? ''}
                  onChange={e => updateContent(slug, e.target.value)}
                  placeholder="Add extra info, FAQs, pricing notes, etc. (Markdown supported)"
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <SaveButton section="content" onClick={() => save('content', { content: links.content })} />
          </div>
        </section>

      </div>
    </div>
  )
}
