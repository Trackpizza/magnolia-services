/**
 * The clinic's Notice of Privacy Practices and Terms of Service (10-11).
 *
 * The text lives in the RECORDS app — edited in its Settings, versioned, and
 * what a patient agrees to when they open their portal — and this site only
 * renders it, so there is one copy, not two drifting apart. Public documents:
 * no patient data crosses here. Refetched at most every 5 minutes.
 */
const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type ClinicLegal = { privacy: string; terms: string; updatedAt: string }

export async function getClinicLegal(): Promise<ClinicLegal | null> {
  if (!API) return null
  try {
    const res = await fetch(`${API}/api/public/legal`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const d = (await res.json()) as Partial<ClinicLegal>
    if (!d.privacy || !d.terms) return null
    return { privacy: d.privacy, terms: d.terms, updatedAt: String(d.updatedAt ?? '') }
  } catch {
    return null
  }
}

/** The headline the stored text starts with duplicates the page's own <h1>. */
export function withoutTitle(md: string): string {
  return md.replace(/^\s*#{1,4}\s+Magnolia Skin Center\s*·[^\n]*\n+/, '')
}
