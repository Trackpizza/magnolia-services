'use client'
import { useState, useEffect } from 'react'
import type { ServiceLinks } from '@/lib/types'
import { DEFAULT_LINKS } from '@/lib/types'
import { SERVICES } from '@/config/services'

// Single source of truth: the editable service list is derived from config/services.ts.
// Keyed by the stable `id` (which never changes); the SEO `slug` (the page URL) can be
// edited freely in config without touching video/content mappings here.
const SERVICE_LIST = SERVICES.map(s => ({ id: s.id, name: s.name }))

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

function FooterLinksEditor({ links, onAdd, onUpdate, onRemove }: {
  links: { label: string; url: string }[]
  onAdd: () => void
  onUpdate: (i: number, key: 'label' | 'url', val: string) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">Footer Links</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add link
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">Add any links you want in the footer (Instagram, Facebook, TikTok, reviews, etc.). Each needs a name and a URL.</p>

      {links.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No links yet — click &ldquo;+ Add link&rdquo; to create one.</p>
      ) : (
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                type="text"
                value={link.label}
                onChange={e => onUpdate(i, 'label', e.target.value)}
                placeholder="Link name (e.g. Instagram)"
                className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                value={link.url}
                onChange={e => onUpdate(i, 'url', e.target.value)}
                placeholder="https://instagram.com/..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove link"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Per-service editor with a YouTube URL + a Markdown box for each service.
// Used by the Pre-Treatment & Planning and After Care sections.
function GuideEditor({ title, description, videos, content, onVideo, onContent, saveButton }: {
  title: string
  description: string
  videos: Record<string, string>
  content: Record<string, string>
  onVideo: (id: string, val: string) => void
  onContent: (id: string, val: string) => void
  saveButton: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        {saveButton}
      </div>
      <p className="text-xs text-gray-400 mb-5">For each service: paste a YouTube URL (optional) and/or write Markdown. Blank fields are hidden on the page. Shows below the main description, before the footer.</p>
      <div className="space-y-8">
        {SERVICE_LIST.map(({ id, name }) => (
          <div key={id} className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{name}</label>
            <input
              type="text"
              value={videos[id] ?? ''}
              onChange={e => onVideo(id, e.target.value)}
              placeholder="YouTube URL (optional) — https://youtube.com/watch?v=..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <textarea
              value={content[id] ?? ''}
              onChange={e => onContent(id, e.target.value)}
              placeholder="Markdown text (optional)"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end">{saveButton}</div>
    </section>
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
        prepVideos: data.prepVideos ?? {},
        prepContent: data.prepContent ?? {},
        afterCareVideos: data.afterCareVideos ?? {},
        afterCareContent: data.afterCareContent ?? {},
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
        prepVideos: data.prepVideos ?? {},
        prepContent: data.prepContent ?? {},
        afterCareVideos: data.afterCareVideos ?? {},
        afterCareContent: data.afterCareContent ?? {},
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

  type FooterKey = 'mainFooter' | 'serviceFooter'

  const addCustomLink = (footer: FooterKey) =>
    setLinks(l => ({ ...l, [footer]: { ...l[footer], customLinks: [...l[footer].customLinks, { label: '', url: '' }] } }))

  const updateCustomLink = (footer: FooterKey, i: number, key: 'label' | 'url', val: string) =>
    setLinks(l => ({
      ...l,
      [footer]: {
        ...l[footer],
        customLinks: l[footer].customLinks.map((link, idx) => idx === i ? { ...link, [key]: val } : link),
      },
    }))

  const removeCustomLink = (footer: FooterKey, i: number) =>
    setLinks(l => ({
      ...l,
      [footer]: { ...l[footer], customLinks: l[footer].customLinks.filter((_, idx) => idx !== i) },
    }))

  const updateServiceFooter = (key: keyof ServiceLinks['serviceFooter'], val: string) =>
    setLinks(l => ({ ...l, serviceFooter: { ...l.serviceFooter, [key]: val } }))

  const updateVideo = (slug: string, url: string) =>
    setLinks(l => ({ ...l, videos: { ...l.videos, [slug]: url } }))

  const updateContent = (slug: string, md: string) =>
    setLinks(l => ({ ...l, content: { ...l.content, [slug]: md } }))

  // Generic per-id updater for the Pre-Treatment / After Care string maps
  type MapKey = 'prepVideos' | 'prepContent' | 'afterCareVideos' | 'afterCareContent'
  const updateMap = (mapKey: MapKey, id: string, val: string) =>
    setLinks(l => ({ ...l, [mapKey]: { ...l[mapKey], [id]: val } }))

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
            <Input label="Main Website URL" value={links.mainFooter.websiteUrl} onChange={v => updateMainFooter('websiteUrl', v)} placeholder="https://www.magnoliaskincenter.com" hint="The logo link" />
          </div>

          <FooterLinksEditor
            links={links.mainFooter.customLinks}
            onAdd={() => addCustomLink('mainFooter')}
            onUpdate={(i, k, v) => updateCustomLink('mainFooter', i, k, v)}
            onRemove={i => removeCustomLink('mainFooter', i)}
          />
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
          <FooterLinksEditor
            links={links.serviceFooter.customLinks}
            onAdd={() => addCustomLink('serviceFooter')}
            onUpdate={(i, k, v) => updateCustomLink('serviceFooter', i, k, v)}
            onRemove={i => removeCustomLink('serviceFooter', i)}
          />
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
            {SERVICE_LIST.map(({ id, name }) => (
              <div key={id} className="grid grid-cols-5 gap-3 items-center">
                <label className="col-span-2 text-sm text-gray-700 font-medium leading-tight">{name}</label>
                <input
                  type="text"
                  value={links.videos[id] ?? ''}
                  onChange={e => updateVideo(id, e.target.value)}
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
            {SERVICE_LIST.map(({ id, name }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{name}</label>
                <textarea
                  value={links.content[id] ?? ''}
                  onChange={e => updateContent(id, e.target.value)}
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

        {/* ── Pre-Treatment & Planning Guide ──────────────────── */}
        <GuideEditor
          title="Pre-Treatment & Planning Guide"
          description="Video + Markdown shown on each service page (after the description, before the footer)."
          videos={links.prepVideos}
          content={links.prepContent}
          onVideo={(id, v) => updateMap('prepVideos', id, v)}
          onContent={(id, v) => updateMap('prepContent', id, v)}
          saveButton={<SaveButton section="prep" onClick={() => save('prep', { prepVideos: links.prepVideos, prepContent: links.prepContent })} />}
        />

        {/* ── After Care ──────────────────────────────────────── */}
        <GuideEditor
          title="After Care"
          description="Video + Markdown shown on each service page (after Pre-Treatment, before the footer)."
          videos={links.afterCareVideos}
          content={links.afterCareContent}
          onVideo={(id, v) => updateMap('afterCareVideos', id, v)}
          onContent={(id, v) => updateMap('afterCareContent', id, v)}
          saveButton={<SaveButton section="aftercare" onClick={() => save('aftercare', { afterCareVideos: links.afterCareVideos, afterCareContent: links.afterCareContent })} />}
        />

      </div>
    </div>
  )
}
