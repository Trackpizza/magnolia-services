/**
 * Pre-treatment and after-care text written in code (10-12), for treatments
 * added after the guides were loaded through /admin. Used only while /admin
 * has nothing saved for that id: the page shows it, the /admin box opens
 * with it, and the first save there makes it the stored copy.
 *
 * House format, same as the live guides: a ### heading, one ✅ line per
 * instruction, a closing line with ✨. No "Video Transcript" — these have no
 * video (`noVideo` on the service).
 *
 * Radiesse: written from the clinic's own RADIESSE informed consent (Setup →
 * Consents) and the Revanesse Versa guides, so the two fillers read alike.
 */

export const DEFAULT_PREP: Record<string, string> = {
  'agnes-rf-targeted-treatment': `### Pre-Treatment Care for Agnes RF Targeted Treatment

✅ One week before your visit, speak with your physician or Dr. David before stopping any prescription medications, and avoid alcohol.

✅ Pause blood-thinning supplements like fish oil, vitamin E, ginkgo, or high-dose ibuprofen and aspirin to help minimize bruising.

✅ Five days before your appointment, stop using retinoids, salicylic acid, benzoyl peroxide, or any harsh chemical exfoliants on and around the area being treated.

✅ Tell us before your visit if your health, medications or allergies have changed — especially an allergy to lidocaine, a history of cold sores, pregnancy or breastfeeding, or a recent procedure in that area.

✅ On the day of your session, arrive with the area completely clean — no makeup, no moisturizers, no heavy creams.

✅ Expect a few days of redness, mild swelling and tiny pin-prick marks in the treated area only.

One area, precisely refreshed — let's get you ready at Magnolia Skin Center ✨`,
  radiesse: `### Pre-Treatment Care for RADIESSE® Dermal Filler

✅ One week before coming in, speak with your physician or Dr. David before stopping any prescription medications, and avoid alcohol.

✅ Cut out aspirin, ibuprofen and other anti-inflammatories, fish oils and vitamin E for one week before your appointment — they make bruising more likely.

✅ Avoid any dental work for two weeks before and after your treatment.

✅ Tell us before your visit if your health, medications or allergies have changed — especially an allergy to lidocaine, a history of cold sores, pregnancy or breastfeeding, or a recent facial procedure.

✅ Arrive bare-faced.

✅ Plan for a few days of possible swelling, redness, tenderness or bruising, and keep big events at least two weeks away.

✅ Have soft ice packs ready at home.

Structure, contour and new collagen start with smart prep — let's get you ready at Magnolia Skin Center ✨`,
}

export const DEFAULT_AFTERCARE: Record<string, string> = {
  'agnes-rf-targeted-treatment': `### Post-Care for Agnes RF Targeted Treatment

✅ Skip alcohol, strenuous workouts, hot saunas, and harsh skincare like retinoids or scrubs on the treated area for the next week.

✅ Keep the area completely clean, washing only with a gentle, non-alcoholic cleanser, and always wash your hands first.

✅ Apply cool compresses to soothe any mild swelling, which is normal for 3 to 5 days.

✅ Stay deeply hydrated and protect the area with SPF 50.

✅ Expect dry, peeling skin and small, raised "collagen balls" in the treated area that clear within 2 to 5 days.

✅ Mild redness, itchiness, tenderness, or temporary numbness in that area are all normal parts of healing.

Let's let that new collagen rebuild exactly where you need it at Magnolia Skin Center ✨`,
  radiesse: `### Post-Care for RADIESSE® Dermal Filler

✅ Apply a clean, cool ice pack gently to ease swelling and tenderness.

✅ Avoid saunas, steam rooms, direct sun and strenuous exercise for at least 24 hours, or until redness and swelling settle.

✅ Don't press, poke or massage the treated area unless your provider has asked you to.

✅ Some swelling, redness, tenderness, firmness or bruising for a few days is normal.

✅ Avoid dental work for two weeks.

✅ RADIESSE® shows up on CT scans and some X-rays — let your dentist, doctors and radiologists know you've had it.

✅ Call us right away about spreading redness, unexpected tenderness, or lumps that don't settle.

✅ Call 911 immediately for sudden vision changes, severe or unusual pain, skin that turns pale or dusky gray, or stroke-like symptoms.

✅ Watch your results build over the coming weeks as your skin makes new collagen.

Structure, lift and new collagen — heal well at Magnolia Skin Center ✨`,
}

/** Stored text wins; a missing or empty entry falls back to the default. */
export function withGuideDefaults(stored: Record<string, string> | undefined, defaults: Record<string, string>): Record<string, string> {
  const out = { ...(stored ?? {}) }
  for (const [id, md] of Object.entries(defaults)) {
    if (!String(out[id] ?? '').trim()) out[id] = md
  }
  return out
}
