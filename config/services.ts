export interface ServiceEntry {
  id: string
  slug: string
  name: string
  category: string
  tagline: string
  searchDescription: string
  keywords: string[]
  highlights: { icon: string; title: string; body: string }[]
  treats: string[]
  howItWorks: { step: string; title: string; body: string }[]
  disclaimer: string
  alsoKnownAs: string[]
}

export const SERVICE_CATEGORIES: Array<{ name: string; description: string; ids: string[] }> = [
  {
    name: 'Agnes RF',
    description: 'Precision radiofrequency microneedling that safely reaches deeper skin layers for lasting, non-surgical results.',
    ids: ['agnes-rf-microneedling', 'agnes-rf-eye-bag-treatment', 'agnes-rf-acne-scar-treatment', 'agnes-rf-non-surgical-facelift'],
  },
  {
    name: 'Scarlet PRO SRF',
    description: 'FDA-cleared short-pulse RF microneedling that stimulates collagen, elastin, and hyaluronic acid with minimal downtime.',
    ids: ['scarlet-pro-srf-microneedling', 'scarlet-srf-body-tightening'],
  },
  {
    name: 'NOUVADerm Laser',
    description: '4th-generation fractional laser for resurfacing, pigmentation, rosacea, and scalp health.',
    ids: ['nouvaderm-laser-resurfacing', 'nouvaderm-laser-rosacea', 'nouvaderm-scalp-laser'],
  },
  {
    name: 'Plasmage',
    description: 'Fractional plasma technology that firms skin and removes lesions with no direct skin contact.',
    ids: ['plasmage-skin-tightening', 'plasmage-eyelid-lift', 'plasmage-scar-removal'],
  },
  {
    name: 'PRP / Cellenis PRP',
    description: 'Platelet-rich plasma from your own blood to stimulate collagen, restore volume, and regenerate naturally.',
    ids: ['cellenis-derma-prp', 'prp-hair-restoration', 'prp-microneedling-facial'],
  },
  {
    name: 'Hair Restoration',
    description: 'Non-surgical treatments to restore scalp health, strengthen follicles, and promote natural regrowth.',
    ids: ['aquafirme-xs-hair-restoration', 'derive-scalp-serum'],
  },
  {
    name: 'Neurotoxins',
    description: 'Precision neurotoxin treatments to smooth lines and refresh your expression — no surgery required.',
    ids: ['daxxify', 'jeuveau', 'xeomin'],
  },
  {
    name: 'Dermal Fillers',
    description: 'Hyaluronic acid fillers for natural-looking volume, contour, and lip enhancement.',
    ids: ['revanesse-versa', 'revanesse-lip'],
  },
  {
    name: 'Chemical Peels',
    description: 'Medical-grade peels for tone, texture, pigmentation, and radiance — with minimal downtime.',
    ids: ['prx-derm-perfexion', 'prx-plus-brightening', 'sensi-peel', 'ultra-peel', 'pigment-peel'],
  },
  {
    name: 'IV Therapy & Injections',
    description: 'Targeted nutrient injections and IV formulas to boost energy, metabolism, and overall wellness.',
    ids: ['b-complex-injection', 'glutathione-injection', 'mic-blend-injection', 'lipotropic-plus', 'ultraburn-injection', 'ic-lipolean'],
  },
  {
    name: 'Peptide & Anti-Aging Therapy',
    description: 'Advanced peptide protocols that work at a cellular level to support longevity, recovery, and skin health.',
    ids: ['bpc-157', 'ghk-cu-copper-peptide', 'sermorelin', 'nad-therapy'],
  },
  {
    name: 'Weight Loss',
    description: 'Medically supervised programs combining clinical guidance, nutrition support, and targeted treatments.',
    ids: ['weight-loss-consultation', 'weight-loss-program'],
  },
  {
    name: 'Financing',
    description: 'Flexible payment options so the treatment you want is never out of reach.',
    ids: ['cherry-payment-plans'],
  },
]

const DISCLAIMER =
  'The information on this page is for educational purposes only and does not constitute medical advice. Results may vary. All aesthetic treatments should only be performed by a licensed or trained professional following a proper consultation. Please consult with a qualified provider to determine if this treatment is right for you. Magnolia Skin Center is located in Burbank, CA and serves clients in the greater Los Angeles area.'

export const SERVICES: ServiceEntry[] = [
  {
    id: 'agnes-rf-microneedling',
    slug: 'agnes-rf-microneedling-for-acne-scars-jowls-wrinkles-skin-tightening-burbank-ca',
    name: 'Agnes RF Microneedling',
    category: 'Agnes RF',
    tagline:
      'Precision RF microneedling using square-wave energy and 9 customizable tips that safely reaches the deeper skin layers where lasting structural change actually happens — not just resurfacing, but remodeling from within.',
    searchDescription:
      'Agnes RF uses square-wave radiofrequency energy and ultra-fine insulated needles to remodel tissue at depth — treating acne, eye bags, jowls, neck laxity, and wrinkles that surface treatments can\'t reach.',
    keywords: ['agnes rf', 'rf microneedling burbank', 'skin tightening', 'jowls', 'eye bags', 'acne treatment', 'neck laxity', 'collagen remodeling'],
    highlights: [
      { icon: '', title: 'Goes beyond the surface', body: 'Standard microneedling works on the surface, creating tiny injuries to stimulate collagen. Agnes RF reaches the deeper skin layers where lasting structural change actually happens.' },
      { icon: '', title: 'Square-wave radiofrequency technology', body: 'Ultra-fine insulated needles deliver precise square-wave RF energy safely into deeper tissue — controlled, targeted, and effective where other treatments cannot reach.' },
      { icon: '', title: 'Real tissue remodeling', body: 'Not just resurfacing — remodeling the tissue beneath. The result is targeted skin tightening, contouring, and rejuvenation that surface treatments simply cannot achieve.' },
      { icon: '', title: '9 customizable tips', body: 'Adaptable to multiple concerns and treatment areas including acne, wrinkles, eye bags, jowls, and neck laxity — all with one precision device.' },
      { icon: '', title: 'Results that build over time', body: 'RF energy triggers a collagen remodeling response that continues for weeks after treatment. Your results improve as your body responds.' },
    ],
    treats: ['Acne', 'Acne Scars', 'Wrinkles', 'Eye Bags', 'Jowls', 'Neck Laxity', 'Nasolabial Folds', 'Skin Tightening'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Agnes RF uses ultra-fine insulated needles with square-wave radiofrequency energy to safely reach the deeper skin layers where lasting structural change actually happens. Unlike standard microneedling, which works on the surface, Agnes RF remodels the tissue beneath — triggering a collagen response that continues building for weeks after your treatment. With 9 customizable tips, it can be precisely adapted to treat acne, wrinkles, eye bags, jowls, and neck laxity in a single device. The result is targeted skin tightening, contouring, and rejuvenation that no surface treatment can replicate.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['turkey neck', 'double chin', 'tech neck lines', 'saggy jawline', 'droopy cheeks', 'face fat'],
  },
  {
    id: 'agnes-rf-eye-bag-treatment',
    slug: 'agnes-rf-eye-bag-treatment',
    name: 'Agnes RF Eye Bag Treatment',
    category: 'Agnes RF',
    tagline:
      'Non-surgical lower eyelid rejuvenation using Agnes RF to remodel the tissue beneath the lower eyelids and tighten the skin simultaneously — no incisions, minimal downtime, and natural-looking results.',
    searchDescription:
      'Agnes RF targets the structural tissue beneath the lower eyelids to reduce puffiness and tighten the overlying skin — a non-surgical alternative to lower blepharoplasty.',
    keywords: ['eye bag treatment', 'under eye puffiness', 'non surgical blepharoplasty', 'lower eyelid tightening', 'agnes rf eye bags burbank'],
    highlights: [
      { icon: '', title: 'No surgery required', body: 'Lower blepharoplasty traditionally required surgery. Agnes RF changes that entirely — no incisions, no general anesthesia, no lengthy recovery.' },
      { icon: '', title: 'Targets the underlying cause', body: 'Ultra-fine insulated needles deliver radiofrequency energy precisely into the tissue beneath the lower eyelids, addressing the deeper structural changes that cause puffiness.' },
      { icon: '', title: 'Tightens and smooths simultaneously', body: 'RF energy remodels the underlying deposits while stimulating collagen in the overlying skin — both concerns treated in a single procedure.' },
      { icon: '', title: 'Minimal downtime', body: 'Most clients return to normal activity quickly with little to no recovery time compared to surgical alternatives.' },
      { icon: '', title: 'Natural-looking results', body: 'A smoother, firmer under-eye area that looks completely natural — rested and refreshed without looking altered.' },
    ],
    treats: ['Under-Eye Puffiness', 'Lower Eyelid Laxity', 'Crepey Under-Eye Skin', 'Shadows from Under-Eye Fullness', 'Skin Laxity', 'Loss of Lower Eyelid Contour'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Lower blepharoplasty is the clinical term for treating under-eye fullness, and traditionally it required surgery. Agnes RF changes that entirely. It uses ultra-fine insulated needles to deliver radiofrequency energy precisely into the tissue beneath the lower eyelids, remodeling the underlying deposits and tightening the skin simultaneously. No incisions, no general anesthesia, no lengthy recovery. Because the needle tips are insulated, surrounding tissue is protected — the energy reaches only where it is directed. The result is a smoother, firmer under-eye area that looks completely natural.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['puffy eyes', 'bags under eyes', 'tired eyes', 'under eye puffiness', 'baggy under eyes', 'non-surgical eye bag fix'],
  },
  {
    id: 'agnes-rf-acne-scar-treatment',
    slug: 'agnes-rf-acne-scar-treatment',
    name: 'Agnes RF Acne & Scar Treatment',
    category: 'Agnes RF',
    tagline:
      'Precision radiofrequency energy targets sebaceous glands at their root to address chronic acne and remodel scar tissue beneath the skin surface.',
    searchDescription:
      'Agnes RF delivers radiofrequency energy directly into sebaceous glands to permanently reduce chronic acne at its source and remodel scar tissue beneath the skin.',
    keywords: ['acne treatment burbank', 'cystic acne', 'acne scar treatment', 'agnes rf acne', 'sebaceous gland treatment', 'enlarged pores'],
    highlights: [
      { icon: '', title: 'Targets sebaceous glands at the root', body: 'Agnes RF delivers energy directly into oil-producing glands, disrupting the source of chronic acne rather than treating surface symptoms.' },
      { icon: '', title: 'Reduces chronic acne — not just temporary relief', body: 'By permanently impairing overactive sebaceous glands, results are lasting and accumulate with each session.' },
      { icon: '', title: 'Smooths scar texture over time', body: 'RF energy remodels scar tissue beneath the skin surface, gradually improving texture and reducing the depth of atrophic scars.' },
      { icon: '', title: 'Insulated needle precision', body: 'The insulated shaft protects the epidermis while delivering targeted energy to the exact dermal depth required for each concern.' },
      { icon: '', title: 'Results build progressively over weeks', body: 'Collagen remodeling and gland disruption continue after each session, with full results typically visible over two to three months.' },
    ],
    treats: ['Acne', 'Cystic Acne', 'Acne Scars', 'Enlarged Pores', 'Skin Texture', 'Sebaceous Hyperplasia'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Agnes RF delivers square-wave radiofrequency energy through a fine insulated needle directly into the sebaceous gland, raising the temperature within the gland to disrupt its ability to produce excess sebum. This targeted approach addresses oil production at the biological source rather than through systemic medications or surface-level treatments. The same RF energy also remodels scar tissue beneath the skin surface, stimulating fibroblast activity and gradually softening the appearance of atrophic scars over multiple sessions. Because the needle is insulated along its shaft, the surrounding epidermis is protected throughout the procedure.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['pimple scars', 'acne marks', 'pitted skin', 'breakout scars', 'chickenpox scars', 'acne craters', 'enlarged pores', 'oily skin treatment'],
  },
  {
    id: 'agnes-rf-non-surgical-facelift',
    slug: 'agnes-rf-non-surgical-facelift',
    name: 'Agnes RF Non-Surgical Facelift',
    category: 'Agnes RF',
    tagline:
      'Tighten jowls, contour the neck, and smooth nasolabial folds without surgery using targeted radiofrequency energy that remodels deeper facial tissue.',
    searchDescription:
      'Agnes RF lifts and contours jowls, tightens the neck, and smooths nasolabial folds using subdermal radiofrequency — structural results without surgery.',
    keywords: ['non surgical facelift', 'jowls treatment', 'neck tightening burbank', 'nasolabial folds', 'agnes rf facelift', 'skin tightening without surgery'],
    highlights: [
      { icon: '', title: 'No surgery or general anesthesia required', body: 'Agnes RF achieves meaningful tissue remodeling through a minimally invasive approach, eliminating the risks and recovery associated with surgical lifting procedures.' },
      { icon: '', title: 'Targets jowls, neck, and nasolabial folds precisely', body: 'The treatment is customizable to address each area of concern with appropriate energy settings, depth, and tip selection.' },
      { icon: '', title: 'Deeper tissue remodeling for structural results', body: 'RF energy reaches the subdermal layer where jowling and fold depth originate, addressing the structural cause rather than surface appearance alone.' },
      { icon: '', title: 'Fully customizable per patient concern', body: 'Agnes RF offers nine needle tips with adjustable energy output, allowing the provider to tailor the protocol to each individual\'s anatomy and goals.' },
      { icon: '', title: 'Long-lasting collagen response', body: 'The collagen remodeling cascade initiated by Agnes RF continues for months after treatment, with results that can last several years with appropriate maintenance.' },
    ],
    treats: ['Jowls', 'Neck Laxity', 'Nasolabial Folds', 'Facial Contouring', 'Skin Tightening', 'Loss of Definition'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Agnes RF delivers square-wave radiofrequency energy through insulated microneedles into the subdermal layer of the face and neck — the tissue layer responsible for jowling, fold depth, and loss of facial definition. The controlled thermal injury at this depth triggers a sustained collagen remodeling response that gradually tightens the overlying skin and repositions facial contours. Treatment is customized to the patient\'s anatomy with precise needle depth and energy settings for each target area, and results continue to develop over the three to six months following treatment.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['turkey neck', 'double chin', 'saggy jawline', 'droopy cheeks', 'face fat', 'melt chin fat', 'tech neck lines'],
  },
  {
    id: 'scarlet-pro-srf-microneedling',
    slug: 'scarlet-pro-srf-microneedling',
    name: 'Scarlet PRO SRF Microneedling',
    category: 'Scarlet PRO SRF',
    tagline:
      'FDA-cleared short-pulse RF microneedling that simultaneously stimulates collagen, elastin, and hyaluronic acid to firm the face, neck, and chest with minimal downtime.',
    searchDescription:
      'Scarlet PRO SRF uses short-pulse radiofrequency microneedling to simultaneously stimulate collagen, elastin, and hyaluronic acid for comprehensive skin firming across the face, neck, and chest.',
    keywords: ['scarlet srf', 'rf microneedling', 'skin firming burbank', 'collagen stimulation', 'neck tightening', 'scarlet pro srf burbank'],
    highlights: [
      { icon: '', title: 'FDA-cleared device with a strong clinical record', body: 'Scarlet PRO SRF has received FDA clearance and has been validated across clinical studies for safety and efficacy on multiple skin types.' },
      { icon: '', title: 'Stimulates collagen, elastin, and hyaluronic acid simultaneously', body: 'The short-pulse RF mechanism activates all three structural components of the dermis in a single treatment session.' },
      { icon: '', title: 'Short-pulse RF for enhanced comfort', body: 'The short-pulse delivery reduces heat accumulation in the skin, making the procedure more comfortable than conventional RF microneedling devices.' },
      { icon: '', title: 'Treats face, neck, and chest in one protocol', body: 'Scarlet PRO SRF can be applied across multiple treatment zones in a single visit, addressing aging consistently across connected areas.' },
      { icon: '', title: 'Safe for all skin tones', body: 'Unlike some energy-based devices, Scarlet PRO SRF does not rely on chromophore targeting, making it appropriate for patients across the full range of Fitzpatrick skin types.' },
    ],
    treats: ['Fine Lines', 'Wrinkles', 'Skin Laxity', 'Pore Size', 'Skin Texture', 'Neck & Chest Aging'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Short-pulse RF energy is delivered through fine needles into the dermis at a precisely controlled depth, creating a uniform thermal stimulus that activates fibroblast activity throughout the treatment zone. Unlike conventional RF microneedling, the short-pulse mechanism minimizes heat buildup at the skin surface while maximizing the depth of collagen, elastin, and hyaluronic acid stimulation. The result is a more comprehensive dermal response with less discomfort and faster recovery. Sessions take approximately 30 to 45 minutes, and improvement continues to develop over the three months following each treatment.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['crepey neck', 'crepey chest', 'saggy neck', 'loose face skin', 'aging skin'],
  },
  {
    id: 'scarlet-srf-body-tightening',
    slug: 'scarlet-srf-body-tightening',
    name: 'Scarlet SRF Body Tightening',
    category: 'Scarlet PRO SRF',
    tagline:
      'Short-pulse RF microneedling for the body — treating stretch marks, spider veins, and sagging skin with virtually no recovery time and results safe for all skin types.',
    searchDescription:
      'Scarlet SRF body tightening addresses stretch marks, spider veins, and sagging skin across body areas using short-pulse RF microneedling safe for all skin types.',
    keywords: ['stretch marks treatment', 'body tightening burbank', 'scarlet srf body', 'spider veins', 'sagging skin', 'postpartum skin', 'skin laxity'],
    highlights: [
      { icon: '', title: 'Safe for all skin types including darker tones', body: 'Scarlet SRF does not rely on light-based targeting, making it one of the few body tightening options appropriate for patients across all Fitzpatrick skin types.' },
      { icon: '', title: 'Treats stretch marks with consistent results', body: 'RF energy remodels the collagen structure in and around stretch marks, gradually reducing their depth and improving their texture over a series of sessions.' },
      { icon: '', title: 'Addresses spider veins on the body', body: 'SRF microneedling can improve the appearance of superficial spider veins and vascular irregularities on body skin.' },
      { icon: '', title: 'Minimal downtime — return to normal activity quickly', body: 'Most patients experience mild redness for 24 to 48 hours following treatment, with no significant restriction on daily activities.' },
      { icon: '', title: 'Body-specific RF microneedling protocol', body: 'Treatment parameters are calibrated for the thicker tissue of body skin, allowing effective delivery of RF energy across a larger surface area.' },
    ],
    treats: ['Stretch Marks', 'Sagging Skin', 'Spider Veins', 'Body Skin Laxity', 'Uneven Texture', 'Skin Tone'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'SRF microneedling delivers short-pulse radiofrequency energy through fine needles into body tissue, creating a controlled thermal stimulus in the dermis that triggers collagen remodeling. For stretch marks, this remodeling process gradually reduces their depth and improves their surface texture. For sagging or lax body skin, the collagen and elastin response firms the tissue over a series of sessions. Parameters are calibrated specifically for body skin, which is typically thicker than facial skin, ensuring effective energy delivery across the treatment area with minimal surface disruption.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['chicken wings', 'bat wings', 'saggy arms', 'mommy tummy', 'mom belly', 'stomach crinkles', 'crepey cleavage', 'bra fat', 'loose knee skin', 'postpartum belly', 'pregnancy stretch marks', 'loose skin after baby'],
  },
  {
    id: 'nouvaderm-laser-resurfacing',
    slug: 'nouvaderm-laser-resurfacing',
    name: 'NOUVADerm Laser Resurfacing',
    category: 'NOUVADerm Laser',
    tagline:
      '4th-generation 1927nm Thulium fractional laser addressing age spots, pigmentation, acne scars, rosacea, and etched lines — with customizable intensity from gentle to intensive.',
    searchDescription:
      'NOUVADerm 4th-generation Thulium fractional laser addresses pigmentation, acne scars, rosacea, and fine lines with customizable intensity from maintenance-level to intensive resurfacing.',
    keywords: ['laser resurfacing burbank', 'nouvaderm laser', 'pigmentation treatment', 'acne scars laser', 'age spots', 'fractional laser burbank', 'thulium laser'],
    highlights: [
      { icon: '', title: '4th-generation 1927nm Thulium technology', body: 'The 1927nm wavelength is specifically absorbed by water in skin cells, making it highly effective for both pigmentation and textural resurfacing while sparing deeper tissue.' },
      { icon: '', title: 'Customizable intensity modes', body: 'Treatment can be calibrated from a gentle maintenance setting to an intensive resurfacing mode, making it appropriate across a wide range of skin concerns and tolerances.' },
      { icon: '', title: 'Treats pigmentation, texture, and laxity in one modality', body: 'NOUVADerm addresses multiple concerns simultaneously, reducing the need for multiple separate treatment types.' },
      { icon: '', title: 'Fractional delivery preserves healthy tissue', body: 'By treating only a fraction of the skin surface at each pass, the device preserves surrounding healthy tissue and accelerates the healing response.' },
      { icon: '', title: 'Proven collagen rejuvenation with lasting results', body: 'The fractional laser stimulus initiates a prolonged collagen synthesis response that continues for months after each treatment session.' },
    ],
    treats: ['Age Spots', 'Pigmentation', 'Acne Scars', 'Rosacea', 'Skin Laxity', 'Fine Lines & Etched Wrinkles'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The 1927nm Thulium fractional laser creates precise micro-channels in the skin, delivering controlled thermal energy to targeted zones while leaving surrounding tissue intact. This fractional approach triggers a collagen synthesis response and accelerates the natural turnover of pigmented and damaged cells, while the preserved tissue between treatment zones ensures faster healing than fully ablative alternatives. Adjustable modes allow the provider to calibrate from a gentle maintenance setting appropriate for mild tone concerns to an intensive resurfacing mode for deeper lines, significant pigmentation, or more advanced texture irregularities.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['sun spots', 'liver spots', 'pregnancy mask', 'dark patches', 'postpartum melasma', 'hormonal dark patches', 'brown spots after pregnancy', 'large pores', 'rough skin'],
  },
  {
    id: 'nouvaderm-laser-rosacea',
    slug: 'nouvaderm-laser-rosacea',
    name: 'NOUVADerm Laser for Rosacea',
    category: 'NOUVADerm Laser',
    tagline:
      'Fractional laser technology precisely targets rosacea and visible vessels while stimulating collagen — delivering a more even, calmer complexion with faster healing than ablative approaches.',
    searchDescription:
      'NOUVADerm fractional laser precisely targets rosacea, visible vessels, and facial redness while stimulating collagen — faster healing than ablative approaches.',
    keywords: ['rosacea treatment burbank', 'facial redness laser', 'spider veins face', 'broken capillaries', 'nouvaderm rosacea', 'vascular laser burbank'],
    highlights: [
      { icon: '', title: 'Targets redness and vascular lesions directly', body: 'The 1927nm Thulium wavelength effectively reaches the vascular structures and pigmented lesions associated with rosacea without excessive surface disruption.' },
      { icon: '', title: 'Preserves healthy surrounding tissue', body: 'Fractional delivery creates precise treatment zones while leaving adjacent healthy skin intact, reducing recovery time and minimizing risk.' },
      { icon: '', title: 'Stimulates collagen simultaneously', body: 'While reducing visible redness, the laser also triggers a collagen synthesis response that improves overall skin quality and firmness.' },
      { icon: '', title: 'Faster healing than ablative alternatives', body: 'The fractional approach and preservation of healthy tissue between treatment zones accelerates the recovery process compared to fully ablative resurfacing.' },
      { icon: '', title: 'Lasting reduction in redness and visible vessels', body: 'A properly sequenced treatment course can produce durable improvements in rosacea-associated redness and vascular irregularities.' },
    ],
    treats: ['Rosacea', 'Facial Redness', 'Spider Veins', 'Broken Capillaries', 'Uneven Skin Tone', 'Visible Vessels'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'NOUVADerm fractional laser energy selectively targets the vascular structures and pigmented lesions associated with rosacea. The 1927nm Thulium wavelength is absorbed by the water and oxyhemoglobin in dilated vessels and superficial vascular lesions, generating controlled thermal energy that disrupts these structures and reduces visible redness. Because the energy is delivered in a fractional pattern, surrounding healthy tissue is preserved between treatment zones, accelerating healing. The laser simultaneously stimulates collagen synthesis in the dermis, improving overall skin quality alongside the reduction in redness.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['red face', 'red cheeks', 'always flushing', 'blotchy skin', 'broken veins on face'],
  },
  {
    id: 'nouvaderm-scalp-laser',
    slug: 'nouvaderm-scalp-laser',
    name: 'NOUVADerm Scalp Laser for Hair',
    category: 'NOUVADerm Laser',
    tagline:
      'A dedicated Hair Support mode uses fractional laser energy to stimulate follicles and promote natural hair regrowth — completely needle-free with no surgery required.',
    searchDescription:
      'NOUVADerm Hair Support mode delivers fractional laser energy to the scalp to stimulate follicles and promote hair regrowth — completely needle-free.',
    keywords: ['hair loss treatment burbank', 'scalp laser therapy', 'hair regrowth laser', 'nouvaderm scalp', 'follicle stimulation laser', 'thinning hair treatment'],
    highlights: [
      { icon: '', title: 'Completely needle-free and non-invasive', body: 'NOUVADerm\'s Hair Support mode delivers follicle-stimulating energy without any injections, needles, or incisions.' },
      { icon: '', title: 'Hair Support mode exclusive to NOUVADerm', body: 'This dedicated treatment mode is calibrated specifically for scalp tissue and follicle stimulation, distinct from the standard resurfacing protocols.' },
      { icon: '', title: 'Stimulates follicles directly through fractional laser energy', body: 'Micro-channels created in the scalp increase blood flow and cellular activity at the follicular level, supporting the conditions for active hair growth.' },
      { icon: '', title: 'Improves scalp circulation and overall scalp health', body: 'The treatment promotes vascularity in the scalp, which is an important factor in sustaining a healthy hair growth environment.' },
      { icon: '', title: 'Results build progressively over multiple sessions', body: 'Follicle stimulation and scalp health improvements are cumulative, with the most significant density improvements typically visible after a series of treatments.' },
    ],
    treats: ['Thinning Hair', 'Hair Loss', 'Scalp Health', 'Follicle Stimulation', 'Hair Density', 'Scalp Circulation'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'NOUVADerm\'s Hair Support mode delivers fractional laser energy into the scalp, creating micro-channels that increase blood flow to hair follicles and stimulate the follicle\'s natural growth cycle. The controlled micro-injuries trigger a healing response that elevates growth factor activity in the follicular environment, encouraging dormant follicles to re-enter the active growth phase. Scalp circulation improves progressively with each session, creating a sustained environment more conducive to healthy hair production. Treatment is performed without needles and requires no surgical intervention or significant downtime.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['thinning hair laser', 'scalp rejuvenation', 'hair growth laser', 'laser for bald spots', 'non-surgical hair regrowth', 'laser hair stimulation'],
  },
  {
    id: 'plasmage-skin-tightening',
    slug: 'plasmage-skin-tightening',
    name: 'Plasmage Skin Tightening',
    category: 'Plasmage',
    tagline:
      'Fractional plasma technology firms crepey skin and smooths fine lines through contactless, controlled pulses that stimulate collagen for long-lasting skin tightening.',
    searchDescription:
      'Plasmage contactless plasma energy firms crepey skin, smooths fine lines, and triggers collagen remodeling through controlled pulses that don\'t require direct skin contact.',
    keywords: ['plasma skin tightening', 'crepey skin treatment', 'plasmage burbank', 'skin firming without surgery', 'fine lines treatment', 'fractional plasma'],
    highlights: [
      { icon: '', title: 'No direct skin contact during treatment', body: 'Plasmage delivers energy through a controlled plasma arc without the device tip touching the skin, reducing the risk of mechanical trauma to the surface.' },
      { icon: '', title: 'Controlled fractional plasma pulses', body: 'Each pulse is precisely metered in duration and intensity, allowing the provider to calibrate treatment to the specific tissue and concern being addressed.' },
      { icon: '', title: 'Firms crepey and lax skin effectively', body: 'The plasma energy causes immediate tissue contraction and initiates a sustained collagen remodeling response that firms loose, crepey skin over time.' },
      { icon: '', title: 'Stimulates deep collagen remodeling', body: 'Beyond surface tightening, the thermal stimulus reaches the deeper dermal layers where collagen scaffolding is rebuilt progressively after each session.' },
      { icon: '', title: 'Long-lasting results with appropriate maintenance', body: 'The collagen response initiated by Plasmage continues for months, and results can be maintained with periodic follow-up treatments.' },
    ],
    treats: ['Crepey Skin', 'Fine Lines', 'Wrinkles', 'Skin Laxity', 'Loose Skin', 'Surface Texture'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Plasmage converts electrical energy into plasma at the tip of the device, releasing controlled micro-pulses on the skin surface without the tip making direct contact. The plasma energy creates controlled micro-injuries in a fractional pattern, triggering an immediate tissue contraction response and initiating the collagen remodeling cascade in the deeper dermis. The fractional nature of the treatment preserves surrounding tissue between each treatment point, reducing recovery time while maintaining the effectiveness of the collagen stimulus. Results develop progressively over the weeks following treatment as new collagen fibers mature and reorganize.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['smoker lines', 'lipstick lines', 'accordion lines', 'belly button sagging', 'crepey skin', 'loose tummy skin'],
  },
  {
    id: 'plasmage-eyelid-lift',
    slug: 'plasmage-eyelid-lift',
    name: 'Plasmage Eyelid Lift',
    category: 'Plasmage',
    tagline:
      'Non-surgical lifting for hooded eyelids and the delicate eye area using plasma energy — safe for areas where traditional laser devices cannot treat.',
    searchDescription:
      'Plasmage non-surgical eyelid lift tightens hooded upper eyelids and smooths periorbital lines using plasma energy — safe where lasers cannot treat.',
    keywords: ['eyelid lift non surgical', 'hooded eyelids treatment', 'plasmage eyelid', 'non surgical blepharoplasty', 'eye area tightening burbank', 'droopy eyelids'],
    highlights: [
      { icon: '', title: 'Safe for the sensitive eyelid and periorbital area', body: 'Plasmage\'s contactless plasma delivery is specifically suitable for the thin, delicate skin of the eyelid where many laser devices carry unacceptable risk.' },
      { icon: '', title: 'Non-surgical blepharoplasty alternative', body: 'For patients with mild to moderate eyelid hooding, Plasmage can achieve meaningful skin tightening without incisions, anesthesia, or surgical recovery.' },
      { icon: '', title: 'Tightens hooded upper eyelid skin', body: 'Controlled plasma pulses cause immediate tissue contraction in the upper eyelid, lifting and opening the eye area progressively over multiple sessions.' },
      { icon: '', title: 'Smooths fine lines around the eyes and mouth', body: 'The treatment is equally effective on crow\'s feet, laugh lines, frown lines, and perioral lines where delicate skin is prone to laxity.' },
      { icon: '', title: 'Minimal downtime compared to surgical options', body: 'Most patients experience localized swelling and micro-crusting for five to seven days, significantly less disruption than surgical blepharoplasty.' },
    ],
    treats: ['Hooded Eyelids', 'Eye Area Lines', 'Loose Upper Eyelid Skin', 'Fine Lines Around Eyes', "Crow's Feet", 'Perioral Lines'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Plasmage plasma energy is applied in precise pulses to the eyelid and periorbital area, stimulating skin contraction and collagen remodeling. The contactless delivery makes it safe for delicate areas where laser devices carry higher risk of thermal injury to underlying structures. Each plasma pulse creates a micro-injury on the skin surface that triggers a localized healing and tightening response, causing the overlying skin to contract and lift progressively. For hooded eyelids, this results in a visible opening and elevation of the lid over the course of the treatment series, without any incisions or sutures.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['hooded eyes', 'droopy eyelids', 'heavy eyelids', 'eye bags', 'laugh lines', 'frown lines'],
  },
  {
    id: 'plasmage-scar-removal',
    slug: 'plasmage-scar-removal',
    name: 'Plasmage Scar & Lesion Removal',
    category: 'Plasmage',
    tagline:
      'Class 2B-rated plasma technology precisely addresses acne scars, moles, skin tags, and warts — safe for sensitive areas with minimal risk and natural-looking results.',
    searchDescription:
      'Plasmage Class 2B plasma technology precisely removes skin tags, moles, warts, and acne scars with minimal risk to surrounding tissue — including sensitive areas.',
    keywords: ['skin tag removal burbank', 'mole removal', 'scar removal', 'plasmage lesion removal', 'wart removal', 'acne scar removal plasma'],
    highlights: [
      { icon: '', title: 'Class 2B medical device rating', body: 'Plasmage carries a Class 2B medical classification, reflecting its clinical validation and safety profile for lesion removal on multiple skin areas.' },
      { icon: '', title: 'Precision removal with minimal risk to surrounding tissue', body: 'The controlled plasma arc targets only the lesion itself, leaving the surrounding healthy skin unaffected — critical for sensitive locations.' },
      { icon: '', title: 'Treats multiple lesion types in a single visit', body: 'Plasmage can address a range of surface lesions including acne scars, skin tags, moles, and warts within the same treatment session.' },
      { icon: '', title: 'Safe for sensitive areas', body: 'The contactless delivery mechanism and adjustable intensity make Plasmage appropriate for treating lesions in anatomically sensitive locations.' },
      { icon: '', title: 'Natural-looking outcomes', body: 'The layered, controlled ablation approach minimizes the risk of scarring or pigmentation changes that can result from less precise removal methods.' },
    ],
    treats: ['Acne Scars', 'Skin Tags', 'Moles', 'Warts', 'Seborrheic Keratosis', 'Surface Lesions'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Plasmage delivers controlled plasma energy directly onto lesions such as skin tags, moles, and scar tissue, causing precise sublimation of the target area without affecting surrounding healthy skin. The treated tissue is removed layer by layer with each pulse, allowing the provider to control the depth and extent of treatment for each specific lesion. Because the plasma arc does not make direct mechanical contact with the skin, the risk of trauma to the surrounding tissue is minimized. The treated area heals progressively over one to two weeks, revealing the underlying skin as the micro-crust naturally separates.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['skin tag removal', 'mole removal', 'spot removal', 'wart removal', 'flesh bumps', 'raised skin spots', 'skin growths'],
  },
  {
    id: 'cellenis-derma-prp',
    slug: 'cellenis-derma-prp',
    name: 'Cellenis Derma PRP',
    category: 'PRP / Cellenis PRP',
    tagline:
      'Platelet-rich plasma from your own blood stimulates collagen, restores natural volume, and improves skin texture — without synthetic fillers or foreign materials.',
    searchDescription:
      'Cellenis Derma PRP uses concentrated platelet-rich plasma from your own blood to stimulate collagen, restore natural volume, and improve skin texture — no synthetic fillers.',
    keywords: ['prp facial burbank', 'platelet rich plasma', 'natural filler', 'prp collagen', 'cellenis prp', 'volume loss treatment', 'acne scars prp'],
    highlights: [
      { icon: '', title: 'Uses your own blood — no synthetic fillers', body: 'Cellenis Derma PRP creates volume and stimulates regeneration using a concentrate derived from your own blood, eliminating the risk of foreign material reactions.' },
      { icon: '', title: 'Stimulates natural collagen production', body: 'The growth factors in platelet-rich plasma activate fibroblasts in the dermis, triggering a sustained collagen synthesis response that builds over weeks.' },
      { icon: '', title: 'Restores volume naturally over time', body: 'PRP-induced collagen and tissue regeneration creates gradual, natural-looking volume improvement without the instant, sometimes overdone appearance of synthetic fillers.' },
      { icon: '', title: 'Treats acne scars and texture effectively', body: 'Growth factors promote cellular turnover and tissue remodeling in scar tissue, softening acne scars and improving overall skin texture progressively.' },
      { icon: '', title: 'Cellenis advanced PRP system for consistent concentration', body: 'The Cellenis centrifuge system produces a reliably concentrated and pure PRP preparation, ensuring consistent growth factor delivery across treatments.' },
    ],
    treats: ['Volume Loss', 'Acne Scars', 'Skin Texture', 'Fine Lines', 'Facial Contour', 'Skin Dullness'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'A small sample of the patient\'s blood is processed using the Cellenis centrifuge system to isolate a concentrated platelet-rich plasma. This concentration process separates the platelets and growth factors from red blood cells and other components, producing a highly potent PRP preparation. The PRP is then introduced into target areas via injection, releasing platelet-derived growth factors that activate fibroblasts, stimulate collagen synthesis, promote cellular regeneration, and gradually restore natural volume. Results develop progressively over the six to eight weeks following each treatment as the tissue remodeling process matures.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['tired mom face', 'postpartum breast deflation', 'restore breast volume', 'stretched breast skin', 'sunken cheeks', 'hollow face', 'natural filler'],
  },
  {
    id: 'prp-hair-restoration',
    slug: 'prp-hair-restoration',
    name: 'PRP Hair Restoration',
    category: 'PRP / Cellenis PRP',
    tagline:
      'Cellenis PRP injected directly at the follicular level stimulates natural hair growth and scalp health using your body\'s own growth factors — no synthetic chemicals, minimal recovery.',
    searchDescription:
      'Cellenis PRP hair restoration injections stimulate dormant follicles and improve scalp health using concentrated growth factors from your own blood — no synthetic chemicals.',
    keywords: ['prp hair restoration burbank', 'hair loss prp', 'platelet rich plasma hair', 'cellenis prp hair', 'postpartum hair loss', 'androgenic alopecia treatment'],
    highlights: [
      { icon: '', title: 'Uses your body\'s own growth factors', body: 'Cellenis PRP is derived from your own blood, delivering the same growth factor signals your body uses naturally for tissue repair — with no synthetic additives.' },
      { icon: '', title: 'Injected at the follicular level for direct stimulation', body: 'PRP is delivered precisely at the depth of the hair follicle, placing growth factors exactly where they need to be to stimulate follicular activity.' },
      { icon: '', title: 'No synthetic chemicals or hormones', body: 'The Cellenis PRP protocol uses only the patient\'s own blood components, making it an appropriate option for patients who prefer to avoid pharmaceutical interventions.' },
      { icon: '', title: 'Improves hair density and scalp health', body: 'Over a series of treatments, patients typically see improvements in hair shaft thickness, density, and scalp condition as the follicular environment is restored.' },
      { icon: '', title: 'Minimal recovery time', body: 'Most patients experience mild tenderness at injection sites for one to two days, with no significant restriction on daily activities following treatment.' },
    ],
    treats: ['Hair Thinning', 'Hair Loss', 'Follicle Health', 'Hair Density', 'Scalp Circulation', 'Androgenic Alopecia'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Cellenis PRP is processed from the patient\'s own blood and injected directly into the scalp at the level of the hair follicles. The concentrated growth factors — including platelet-derived growth factor (PDGF), vascular endothelial growth factor (VEGF), and epidermal growth factor (EGF) — stimulate dormant follicles, prolong the active anagen growth phase, and improve scalp vascularity. The treatment is typically performed in a series of three to four sessions spaced four to six weeks apart, with maintenance treatments recommended every six to twelve months to sustain the benefits.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['postpartum hair loss', 'thinning crown', 'receding hairline', 'hair shedding', 'losing hair after baby', 'hormonal hair loss', 'covid hair loss', 'thinning edges'],
  },
  {
    id: 'prp-microneedling-facial',
    slug: 'prp-microneedling-facial',
    name: 'PRP Microneedling Facial',
    category: 'PRP / Cellenis PRP',
    tagline:
      'Cellenis PRP combined with microneedling for superior rejuvenation — targeting dark circles, pigmentation, and stretch marks while improving tone and hydration.',
    searchDescription:
      'PRP microneedling facial combines Cellenis PRP with microneedling channels for superior penetration — addressing dark circles, pigmentation, stretch marks, and skin tone.',
    keywords: ['prp microneedling burbank', 'vampire facial', 'microneedling with prp', 'dark circles treatment', 'pigmentation microneedling', 'cellenis prp microneedling'],
    highlights: [
      { icon: '', title: 'PRP significantly enhances microneedling results', body: 'The combination of microneedling channels and PRP growth factors produces measurably better outcomes than either treatment delivers independently.' },
      { icon: '', title: 'Micro-channels improve absorption of growth factors', body: 'Microneedling creates pathways that allow PRP to penetrate far deeper than topical application alone, placing growth factors exactly where collagen stimulation occurs.' },
      { icon: '', title: 'Targets pigmentation and dark circles specifically', body: 'PRP growth factors have demonstrated efficacy in reducing melanin deposition and improving the appearance of periorbital dark circles and diffuse pigmentation.' },
      { icon: '', title: 'Improves hydration and overall skin tone', body: 'The regenerative signals in PRP promote hyaluronic acid production and improve the dermis\'s water-retention capacity, resulting in more hydrated, luminous skin.' },
      { icon: '', title: 'Comprehensive skin rejuvenation in one session', body: 'The combined protocol addresses multiple concerns — texture, pigmentation, tone, hydration, and fine lines — simultaneously rather than requiring separate treatments.' },
    ],
    treats: ['Dark Circles', 'Pigmentation', 'Stretch Marks', 'Dull Skin', 'Uneven Tone', 'Fine Lines'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Microneedling creates micro-channels in the skin that dramatically increase the absorption of Cellenis PRP. The platelet growth factors penetrate deeper than topical application alone, amplifying collagen stimulation and cellular regeneration throughout the treated area. The microneedling itself initiates a wound-healing response that the PRP growth factors then accelerate and direct toward collagen synthesis, pigmentation reduction, and tissue regeneration. The combined protocol is applied across the face, under-eye area, or body depending on the concerns being addressed, with recovery typically consisting of mild redness for 24 to 48 hours.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['vampire facial', 'blood facial', 'microneedling with prp', 'glow facial', 'dark circle treatment', 'skin rejuvenation facial'],
  },
  {
    id: 'aquafirme-xs-hair-restoration',
    slug: 'aquafirme-xs-hair-restoration',
    name: 'AquaFirme XS Hair Restoration',
    category: 'Hair Restoration',
    tagline:
      'Non-invasive hair restoration using suction extraction and ultrasound infusion of DE|RIVE plant-based exosomes and stem cells to activate follicle growth — painless and needle-free.',
    searchDescription:
      'AquaFirme XS uses suction extraction and ultrasound infusion of DE|RIVE plant-based exosomes and stem cells to stimulate hair follicles — completely needle-free.',
    keywords: ['needle free hair restoration', 'aquafirme hair', 'derive exosomes hair', 'non invasive hair growth', 'hair loss treatment burbank', 'exosome hair therapy'],
    highlights: [
      { icon: '', title: 'Completely needle-free and painless', body: 'AquaFirme XS achieves follicle stimulation without any injections, needles, or surgical procedures, making it appropriate for patients who prefer a non-invasive approach.' },
      { icon: '', title: 'DE|RIVE plant-based exosomes and stem cells', body: 'The DE|RIVE serum contains plant-derived exosomes and stem cell signaling compounds that communicate directly with hair follicle cells to reactivate the growth cycle.' },
      { icon: '', title: 'Ultrasound infusion for deep delivery', body: 'Low-frequency ultrasound energy drives the DE|RIVE serum deep into the scalp, achieving a penetration depth that topical application cannot reach.' },
      { icon: '', title: 'Activates follicle signaling pathways', body: 'The exosomes in DE|RIVE carry growth and signaling molecules that directly stimulate the molecular pathways responsible for initiating and sustaining hair follicle activity.' },
      { icon: '', title: 'No downtime and no discomfort', body: 'The treatment is entirely non-invasive with no recovery period, and most patients describe the experience as comfortable throughout.' },
    ],
    treats: ['Hair Thinning', 'Hair Loss', 'Follicle Dormancy', 'Hair Density', 'Scalp Health', 'Fine Hair'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'AquaFirme XS first uses suction extraction to clear scalp buildup, remove excess sebum, and open the follicular channels that can become obstructed over time. This preparation step ensures that the subsequent infusion reaches the follicles effectively. Ultrasound energy then drives the DE|RIVE exosomes and plant-based stem cells deep into the scalp tissue at a depth that topical application cannot achieve, delivering the cellular signaling molecules needed to reactivate the natural hair growth cycle. The entire process is performed without needles or surgery, with no required recovery period and no discomfort.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ["widow's peak", 'receding hairline', 'bald spots', 'thinning crown', 'postpartum hair loss', 'covid hair loss', 'losing hair after baby', 'thinning edges after pregnancy', 'hormonal hair shedding'],
  },
  {
    id: 'derive-scalp-serum',
    slug: 'derive-scalp-serum',
    name: 'DE|RIVE Scalp Serum Infusion',
    category: 'Hair Restoration',
    tagline:
      '100% organic, hormone-free plant-based serum with Cytokeratin-15 exosomes and stem cells, infused deep into the scalp to activate follicles and promote thicker, healthier hair.',
    searchDescription:
      'DE|RIVE scalp serum infusion delivers 100% organic, hormone-free plant-based exosomes and Cytokeratin-15 deep into the scalp to activate follicles and promote thicker hair.',
    keywords: ['derive scalp serum', 'organic hair restoration', 'cytokeratin 15', 'plant based hair loss treatment', 'exosome scalp therapy burbank', 'hormonal hair loss treatment'],
    highlights: [
      { icon: '', title: '100% organic and hormone-free formulation', body: 'DE|RIVE is entirely plant-derived and contains no synthetic hormones or pharmaceutical compounds, making it suitable for patients who prefer a natural approach to hair restoration.' },
      { icon: '', title: 'Contains Cytokeratin-15 — a key follicle signaling protein', body: 'Cytokeratin-15 is a structural protein expressed in hair follicle stem cells and plays a direct role in the regulation of the hair growth cycle at the cellular level.' },
      { icon: '', title: 'Plant-based exosomes and stem cells for deep communication', body: 'Exosomes carry molecular signals that communicate between cells; DE|RIVE\'s plant-based exosomes deliver follicle-activating messages that synthetic compounds cannot replicate.' },
      { icon: '', title: 'Addresses multiple causes of hair loss', body: 'DE|RIVE\'s signaling approach is effective across the range of hair loss causes — aging, hormonal changes, post-illness recovery, and environmental factors — without requiring identification of a single cause.' },
      { icon: '', title: 'Deeply infused for maximum follicular efficacy', body: 'The serum is delivered deep into the scalp via professional infusion, reaching the follicular level where topical products applied at home cannot penetrate.' },
    ],
    treats: ['Hair Loss from Aging', 'Post-COVID Hair Loss', 'Hormonal Hair Loss', 'Hair Thinning', 'Follicle Dormancy', 'Hair Density'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'DE|RIVE contains Cytokeratin-15, a structural protein that plays a direct role in hair follicle cycling by regulating the behavior of follicle stem cells. Delivered deep into the scalp via professional infusion, the plant-based exosomes and stem cells communicate with follicle cells to reactivate growth signals and prolong the anagen phase of the hair cycle. This approach addresses hair loss from a variety of causes — including aging, hormonal changes, post-illness recovery (including post-COVID hair loss), and environmental factors — because it acts on the shared molecular machinery of follicle activity rather than addressing a single pathway.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['postpartum hair loss', 'covid hair loss', 'hormonal hair loss', 'baby shedding', 'losing hair after baby', 'thinning edges', 'hair shedding after pregnancy'],
  },
  {
    id: 'daxxify',
    slug: 'daxxify',
    name: 'Daxxify',
    category: 'Neurotoxins',
    tagline:
      'Peptide-enhanced botulinum toxin with faster onset and results lasting up to six months — the longest duration of any FDA-approved neurotoxin.',
    searchDescription:
      'Daxxify peptide-enhanced neurotoxin delivers faster onset and up to 6 months duration — the longest-lasting FDA-approved neurotoxin for dynamic wrinkle treatment.',
    keywords: ['daxxify burbank', 'longest lasting botox', 'peptide neurotoxin', 'daxxify injections', 'frown lines burbank', 'neurotoxin 6 months'],
    highlights: [
      { icon: '', title: 'Up to 6 months duration — the longest-lasting neurotoxin', body: 'Clinical studies have demonstrated Daxxify results lasting up to six months in the majority of patients, significantly longer than traditional neurotoxin options.' },
      { icon: '', title: 'Peptide-enhanced formula for superior binding', body: 'Daxxify\'s proprietary peptide stabilizer binds the botulinum toxin more effectively to nerve receptors, contributing to both faster onset and extended duration.' },
      { icon: '', title: 'Faster onset than standard neurotoxins', body: 'Patients typically begin noticing muscle relaxation within one to two days of treatment, earlier than the three to five days typical of other options.' },
      { icon: '', title: 'Made in the USA with no animal by-products', body: 'Daxxify is manufactured using a process that does not rely on human serum albumin or any animal-derived components, making it suitable for patients who prefer this distinction.' },
      { icon: '', title: 'Precise dosing across all dynamic wrinkle areas', body: 'Daxxify is administered in small, accurate doses to achieve natural-looking muscle relaxation tailored to each patient\'s anatomy and desired outcome.' },
    ],
    treats: ['Frown Lines', 'Forehead Lines', "Crow's Feet", 'Brow Heaviness', 'Neck Bands', 'Dynamic Wrinkles'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Daxxify uses a peptide stabilizer that binds the botulinum toxin more effectively to the SNAP-25 protein at the neuromuscular junction, blocking the nerve signals that cause muscle contractions responsible for dynamic wrinkles. The superior binding affinity of the peptide-toxin complex contributes to both faster visible onset — typically within one to two days — and the extended duration that differentiates Daxxify from conventional neurotoxins. Treatment involves small, precise injections into targeted facial muscles, and the total session typically takes fifteen to thirty minutes with no required recovery period.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['long lasting botox', 'botox alternative', 'peptide botox', '6 month botox', 'forehead wrinkle injections', 'frown line injections'],
  },
  {
    id: 'jeuveau',
    slug: 'jeuveau',
    name: 'Jeuveau',
    category: 'Neurotoxins',
    tagline:
      'FDA-approved neurotoxin for frown lines, crow\'s feet, and jawline slimming — with visible results in three to five days and results lasting three to four months.',
    searchDescription:
      'Jeuveau FDA-approved neurotoxin treats frown lines, crow\'s feet, and jawline slimming with visible results in 3–5 days — manufactured exclusively for aesthetic use.',
    keywords: ['jeuveau burbank', 'newtox injections', 'frown lines treatment', 'jaw slimming neurotoxin', "crow's feet burbank", 'aesthetic neurotoxin'],
    highlights: [
      { icon: '', title: 'FDA-approved specifically for aesthetic use', body: 'Jeuveau (prabotulinumtoxinA) received FDA approval for the treatment of moderate to severe glabellar lines and is manufactured exclusively for cosmetic applications.' },
      { icon: '', title: 'Visible results in 3 to 5 days', body: 'Patients typically notice muscle relaxation and wrinkle smoothing within three to five days following treatment, with full effect visible within two weeks.' },
      { icon: '', title: '3 to 4 months duration with extended results via maintenance', body: 'Results from a single treatment last three to four months on average, and patients on a regular maintenance schedule often find results extending over time.' },
      { icon: '', title: 'Treats frown lines, crow\'s feet, and jawline', body: 'Jeuveau is appropriate for multiple treatment areas including the glabella, periorbital area, and masseter muscle for jawline contouring.' },
      { icon: '', title: 'Consistent, predictable outcomes', body: 'Jeuveau\'s purification process produces a consistent formulation that delivers reliable results across treatment sessions.' },
    ],
    treats: ['Frown Lines', "Crow's Feet", 'Forehead Lines', 'Jawline Slimming', 'Brow Lift', 'Dynamic Wrinkles'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Jeuveau (prabotulinumtoxinA) is an FDA-approved botulinum toxin purified specifically for aesthetic use. Small, precise injections into targeted facial muscles temporarily reduce their contractile activity by blocking the acetylcholine release at the neuromuscular junction. This temporary muscle relaxation smooths the overlying dynamic wrinkles — the lines caused by repeated facial expressions — without affecting the resting appearance of the face. Results become visible within three to five days and reach full effect within two weeks, with the treatment typically taking fifteen to twenty minutes with no required recovery period.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['newtox', 'botox alternative', 'wrinkle relaxer', 'frown line fixer', 'jaw slimming injection', "crow's feet treatment"],
  },
  {
    id: 'xeomin',
    slug: 'xeomin',
    name: 'Xeomin',
    category: 'Neurotoxins',
    tagline:
      'A purified neurotoxin with no accessory proteins — reducing antibody resistance risk over time, with results visible in five to seven days and lasting up to nine months.',
    searchDescription:
      'Xeomin protein-free neurotoxin reduces antibody resistance risk for long-term patients — results in 5–7 days lasting up to 9 months.',
    keywords: ['xeomin burbank', 'protein free botox', 'xeomin injections', 'frown lines', 'neurotoxin resistance', 'long lasting neurotoxin burbank'],
    highlights: [
      { icon: '', title: 'No accessory proteins — reduces antibody resistance risk', body: 'Xeomin contains only the pure botulinum toxin molecule without complexing proteins, reducing the likelihood of the immune system developing neutralizing antibodies over repeated treatments.' },
      { icon: '', title: 'FDA-approved for aesthetic and therapeutic use', body: 'Xeomin holds FDA approval for cosmetic treatment of glabellar frown lines and has an established safety record across both aesthetic and medical applications.' },
      { icon: '', title: 'Results visible in 5 to 7 days', body: 'Patients typically begin to see muscle relaxation within five to seven days of injection, with the full effect visible within two weeks.' },
      { icon: '', title: 'Up to 9 months duration reported in some patients', body: 'Xeomin\'s results typically last three to six months, with some patients reporting duration extending to nine months, particularly with consistent treatment schedules.' },
      { icon: '', title: 'Precise dosing for natural-looking outcomes', body: 'The pure formulation allows for accurate, consistent dosing that produces natural-looking muscle relaxation without an overdone or frozen appearance.' },
    ],
    treats: ['Frown Lines', 'Forehead Lines', "Crow's Feet", 'Neck Bands', 'Brow Heaviness', 'Dynamic Wrinkles'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Xeomin contains only the active botulinum toxin type A molecule, without the complexing proteins present in other neurotoxin formulations. This protein-free structure reduces the likelihood of the immune system generating antibodies against the product — an important consideration for patients receiving repeated treatments over years. Injected into targeted facial muscles, Xeomin blocks the release of acetylcholine at the neuromuscular junction, temporarily inhibiting the muscle contractions responsible for dynamic wrinkles. Results are visible within five to seven days and are well-established across both aesthetic and therapeutic clinical applications.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['naked botox', 'pure botox', 'protein-free botox', 'botox alternative', 'wrinkle injection', 'forehead lines treatment'],
  },
  {
    id: 'revanesse-versa',
    slug: 'revanesse-versa',
    name: 'Revanesse Versa Filler',
    category: 'Dermal Fillers',
    tagline:
      'FDA-approved hyaluronic acid filler that restores facial volume and enhances contours naturally — with less post-treatment swelling and results lasting up to twelve months.',
    searchDescription:
      'Revanesse Versa FDA-approved hyaluronic acid filler restores facial volume and contour with less post-treatment swelling than comparable fillers — results up to 12 months.',
    keywords: ['revanesse versa burbank', 'hyaluronic acid filler', 'facial volume restoration', 'nasolabial folds filler', 'cheek filler burbank', 'dermal filler less swelling'],
    highlights: [
      { icon: '', title: 'FDA-approved hyaluronic acid filler', body: 'Revanesse Versa holds FDA approval for the treatment of moderate to severe facial wrinkles and folds, with an established clinical safety profile.' },
      { icon: '', title: 'Less swelling than comparable fillers', body: 'Clinical studies comparing Revanesse Versa to Juvederm Ultra Plus demonstrated significantly less post-injection swelling, making it a preferred choice for patients concerned about downtime appearance.' },
      { icon: '', title: 'Smooth, consistent spherical particle texture', body: 'The uniform spherical particle structure of Revanesse Versa integrates smoothly into tissue, producing natural-feeling results without lumpiness or irregularity.' },
      { icon: '', title: 'Restores volume naturally with immediate results', body: 'Hyaluronic acid\'s water-attracting properties provide immediate volumization that mimics natural tissue, with results visible immediately after treatment.' },
      { icon: '', title: 'Results lasting up to 12 months', body: 'Revanesse Versa maintains its volumizing effect for up to twelve months in most patients, with touch-up treatments available to extend and maintain results.' },
    ],
    treats: ['Volume Loss', 'Nasolabial Folds', 'Cheek Hollowing', 'Facial Contour', 'Under-Eye Hollows', 'Mid-Face Deflation'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Revanesse Versa is a cross-linked hyaluronic acid filler with a uniform spherical particle structure that integrates smoothly into tissue upon injection. Hyaluronic acid is a naturally occurring substance in the skin responsible for hydration and volume; as the skin ages, this volume diminishes. Injected into targeted facial areas using a fine needle or cannula, Revanesse Versa restores lost volume, softens deep folds, and enhances natural facial contours while attracting and retaining water to maintain ongoing hydration in the treated area. Results are immediate and typically last up to twelve months.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['cheek filler', 'face filler', 'nasolabial fold filler', 'smile line filler', 'under eye filler', 'hollow cheek treatment', 'facial volume loss'],
  },
  {
    id: 'revanesse-lip',
    slug: 'revanesse-lip',
    name: 'Revanesse Lip Filler',
    category: 'Dermal Fillers',
    tagline:
      'Hyaluronic acid lip filler with lidocaine for comfort — delivering natural volume and definition with minimal swelling and over 95% client satisfaction at six months.',
    searchDescription:
      'Revanesse lip filler with lidocaine delivers natural volume and definition with minimal swelling — over 95% client satisfaction at 6 months.',
    keywords: ['lip filler burbank', 'revanesse lips', 'natural lip augmentation', 'lip volume burbank', 'hyaluronic lip filler', 'lip definition treatment'],
    highlights: [
      { icon: '', title: 'Contains lidocaine for comfort during treatment', body: 'Revanesse lip filler is pre-mixed with lidocaine, a local anesthetic, significantly reducing the discomfort of lip injection compared to formulas without it.' },
      { icon: '', title: 'Minimal swelling compared to other lip fillers', body: 'Clinical comparisons have demonstrated that Revanesse produces less post-treatment swelling than other leading lip filler options, reducing visible recovery time.' },
      { icon: '', title: 'Natural volume and definition', body: 'The hyaluronic acid formula integrates naturally into lip tissue, producing soft, proportional enhancement rather than an overfilled appearance.' },
      { icon: '', title: 'Over 95% of clients report visible improvement at 6 months', body: 'Clinical data supporting Revanesse lip filler shows high patient satisfaction with maintained results at the six-month mark.' },
      { icon: '', title: 'Hyaluronic acid is reversible with hyaluronidase', body: 'Like all HA fillers, Revanesse lip results can be adjusted or reversed with hyaluronidase enzyme if needed — providing an important safety margin for lip treatments.' },
    ],
    treats: ['Lip Volume', 'Lip Definition', 'Lip Border', 'Lip Asymmetry', 'Perioral Lines', 'Lip Hydration'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Revanesse lip filler is injected using a fine cannula or needle into the lip body, vermilion border, and surrounding perioral area to add volume, improve definition, and smooth perioral lines. The hyaluronic acid formula contains lidocaine, which is released at the injection site to reduce discomfort as the treatment progresses. The spherical particle structure of Revanesse integrates naturally into lip tissue, producing soft, moveable results with minimal post-treatment swelling. Results are visible immediately and typically last six to nine months, with longevity varying based on individual metabolism and treatment area.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['lip plumping', 'natural lip filler', 'lip enhancement', 'lip augmentation', 'thin lip treatment', 'lip definition', 'lip border filler'],
  },
  {
    id: 'prx-derm-perfexion',
    slug: 'prx-derm-perfexion',
    name: 'PRX Derm Perfexion',
    category: 'PRX Therapy',
    tagline:
      'Patented 33% TCA biostimulator that boosts collagen deep in the dermis with no visible peeling and no downtime — results lasting six to twelve months.',
    searchDescription:
      'PRX Derm Perfexion patented 33% TCA biostimulator boosts deep dermal collagen with zero peeling and no downtime — results lasting 6–12 months.',
    keywords: ['prx derm perfexion', 'no peel chemical treatment', 'collagen biostimulator', 'prx therapy burbank', 'no downtime skin treatment', 'tca no peel'],
    highlights: [
      { icon: '', title: 'No peeling and no downtime', body: 'Unlike traditional TCA peels, PRX Derm Perfexion stimulates the dermis without triggering the surface peeling response — allowing patients to return to normal activity immediately.' },
      { icon: '', title: 'Patented 33% TCA formula with a unique delivery mechanism', body: 'The proprietary combination of TCA and hydrogen peroxide allows deep penetration without the surface reactivity typically associated with high-concentration acid formulas.' },
      { icon: '', title: 'Boosts collagen deep in the dermis', body: 'The formula reaches and activates fibroblasts in the deeper dermal layer, stimulating a sustained collagen synthesis response without disrupting the epidermis.' },
      { icon: '', title: 'Tightens pores and smooths texture', body: 'Repeated sessions produce measurable improvement in pore size, skin texture, and overall surface refinement as the dermis remodels over time.' },
      { icon: '', title: 'Results last 6 to 12 months', body: 'The collagen stimulation initiated by PRX Derm Perfexion produces durable improvements that typically persist for six to twelve months with appropriate skincare maintenance.' },
    ],
    treats: ['Enlarged Pores', 'Skin Texture', 'Fine Lines', 'Collagen Loss', 'Skin Firmness', 'Dull Complexion'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'PRX Derm Perfexion uses a patented combination of 33% trichloroacetic acid (TCA) and hydrogen peroxide that penetrates deeply into the skin without triggering the surface peeling response typical of acid treatments. The hydrogen peroxide component neutralizes the surface reactivity of the TCA, allowing the active ingredient to bypass the epidermis and reach fibroblasts in the deeper dermis. There it stimulates collagen and elastin synthesis, improves skin firmness, and refines pore size — all with the skin surface remaining completely intact and no visible recovery period required.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['no peel facial', 'invisible peel', 'lunchtime facial', 'no downtime facial', 'zero downtime treatment', 'skin tightening no recovery'],
  },
  {
    id: 'prx-plus-brightening',
    slug: 'prx-plus-brightening',
    name: 'PRX-PLUS Brightening',
    category: 'PRX Therapy',
    tagline:
      'Patented biostimulator that targets hyperpigmentation and melasma at the cellular level — brightening all skin layers and stimulating collagen with no peeling and no downtime.',
    searchDescription:
      'PRX-PLUS brightening biostimulator targets melasma and hyperpigmentation at the cellular level — stimulating collagen without peeling or downtime.',
    keywords: ['prx plus brightening', 'melasma treatment burbank', 'hyperpigmentation no downtime', 'brightening biostimulator', 'prx plus burbank', 'dark spots no peel treatment'],
    highlights: [
      { icon: '', title: 'Targets melasma and hyperpigmentation at the cellular level', body: 'PRX-PLUS inhibits melanin synthesis pathways within melanocytes, addressing pigmentation at the source rather than at the skin surface.' },
      { icon: '', title: 'Brightens all skin layers simultaneously', body: 'The formula\'s deep penetration means it addresses both superficial and deeper-seated pigmentation in a single treatment application.' },
      { icon: '', title: 'Stimulates collagen with no surface peeling', body: 'Like the original PRX formula, PRX-PLUS delivers its biostimulating benefits to the dermis without disrupting the epidermal surface.' },
      { icon: '', title: 'No downtime — suitable year-round', body: 'The absence of surface peeling means patients can schedule treatments at any time without concern for sun sensitivity or visible recovery.' },
      { icon: '', title: 'Visible improvement in tone and luminosity', body: 'Patients typically notice measurable brightening and improvement in overall skin tone beginning within one to two weeks of treatment.' },
    ],
    treats: ['Hyperpigmentation', 'Melasma', 'Dark Spots', 'Uneven Skin Tone', 'Post-Inflammatory Hyperpigmentation', 'Skin Dullness'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'PRX-PLUS delivers a brightening biostimulator formula that penetrates deeply through the epidermis without causing surface peeling. The active brightening ingredients inhibit the tyrosinase enzyme responsible for melanin production at the cellular level, reducing pigment formation in melanocytes at multiple skin layers simultaneously. While the brightening mechanism is active in the epidermis and upper dermis, the TCA component stimulates fibroblasts in the deeper dermis, promoting collagen synthesis. The result is a dual action — reduced pigmentation and improved skin structure — occurring simultaneously in a single treatment with no visible downtime.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['pregnancy mask treatment', 'melasma facial', 'brown spots no peel', 'hormonal dark patches', 'brightening treatment', 'no downtime brightening'],
  },
  {
    id: 'sensi-peel',
    slug: 'sensi-peel',
    name: 'Sensi Peel',
    category: 'Chemical Peels',
    tagline:
      'Gentle PCA Skin peel designed for sensitive and reactive skin — brightening the complexion and smoothing texture with minimal irritation and no significant downtime.',
    searchDescription:
      'Sensi Peel gentle PCA Skin chemical peel designed for sensitive and reactive skin types — brightening and smoothing texture with no significant downtime.',
    keywords: ['sensitive skin peel', 'sensi peel burbank', 'pca skin peel', 'gentle chemical peel', 'reactive skin treatment', 'rosacea skin peel'],
    highlights: [
      { icon: '', title: 'Formulated specifically for sensitive skin types', body: 'PCA Skin developed the Sensi Peel specifically for reactive, rosacea-prone, or sensitized skin types that cannot tolerate standard chemical peel formulations.' },
      { icon: '', title: 'Minimal irritation during and after treatment', body: 'The low-acid formula is calibrated to resurface the skin without triggering the redness, stinging, or inflammatory response common in sensitive patients with conventional peels.' },
      { icon: '', title: 'Brightens and evens complexion', body: 'Despite its gentle formulation, the Sensi Peel delivers meaningful improvement in skin brightness and tone uniformity over a series of treatments.' },
      { icon: '', title: 'Smooths skin texture effectively', body: 'Chemical exfoliation at a tolerable concentration removes dull, uneven surface cells and promotes cellular renewal, improving overall skin texture.' },
      { icon: '', title: 'No significant downtime — safe year-round', body: 'The Sensi Peel does not require a recovery period and can be performed at any time of year without concern for seasonal light sensitivity.' },
    ],
    treats: ['Sensitive Skin Concerns', 'Uneven Tone', 'Mild Discoloration', 'Rough Texture', 'Dullness', 'Redness-Prone Skin'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The Sensi Peel uses a carefully calibrated low-acid formula designed to resurface the skin without triggering the irritation response common in sensitive individuals. It gently dissolves the bonds between dead surface cells, allowing them to shed naturally and promoting the emergence of fresher, more evenly pigmented skin beneath. Because the concentration is specifically adjusted for reactive skin, the barrier function is maintained throughout the process, preventing the rebound sensitivity or inflammation that poorly tolerated peels can cause. The treatment is performed in a clinical setting and suitable for patients who have previously found chemical peels too aggressive.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['gentle peel', 'rosacea peel', 'sensitive skin facial', 'reactive skin peel', 'no downtime peel', 'mild chemical peel'],
  },
  {
    id: 'ultra-peel',
    slug: 'ultra-peel',
    name: 'Ultra Peel',
    category: 'Chemical Peels',
    tagline:
      'PCA Skin brightening peel that evens tone, reduces dark patches, and softens fine lines — suitable for all skin types including sensitive skin, with minimal downtime.',
    searchDescription:
      'Ultra Peel PCA Skin brightening chemical peel evens tone, reduces dark patches, and softens fine lines — suitable for all skin types with minimal downtime.',
    keywords: ['ultra peel burbank', 'brightening peel', 'pca skin ultra peel', 'dark patches peel', 'chemical peel all skin types', 'tone evening peel'],
    highlights: [
      { icon: '', title: 'PCA Skin medical-grade formula', body: 'PCA Skin is a leading professional skincare brand with a science-backed formulation philosophy, and the Ultra Peel reflects that standard in concentration and ingredient selection.' },
      { icon: '', title: 'Suitable for sensitive skin types', body: 'The formula is calibrated to deliver brightening and exfoliating benefits without triggering excessive irritation in patients with reactive or sensitive skin.' },
      { icon: '', title: 'Evens tone and reduces dark patches', body: 'Active brightening agents in the peel address surface discoloration and dark patches, producing a more uniform complexion over a series of treatments.' },
      { icon: '', title: 'Softens fine lines and surface texture', body: 'Chemical exfoliation accelerates cellular turnover, gradually smoothing surface irregularities and reducing the appearance of fine lines with each treatment.' },
      { icon: '', title: 'Minimal downtime', body: 'Most patients experience light flaking for two to four days following treatment, significantly less than deeper peel options while still delivering visible improvement.' },
    ],
    treats: ['Uneven Skin Tone', 'Dark Patches', 'Fine Lines', 'Dull Complexion', 'Sun Damage', 'Mild Discoloration'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The Ultra Peel uses a synergistic blend of brightening acids at controlled concentrations to exfoliate the outer skin layers, remove damaged and pigmented surface cells, and stimulate cellular renewal in the underlying skin. PCA Skin\'s formulation is calibrated for tolerability across skin types, including sensitive skin, while delivering measurable improvement in tone, texture, and brightness. The treatment is applied in a clinical setting and works progressively over the days following application as the skin completes its renewal cycle, with light flaking representing the removal of treated surface cells.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['brightening peel', 'dark patch peel', 'even skin treatment', 'tone correcting peel', 'mild brightening facial', 'sun damage peel'],
  },
  {
    id: 'pigment-peel',
    slug: 'pigment-peel',
    name: 'Pigment Peel',
    category: 'Chemical Peels',
    tagline:
      'Multi-acid PCA Skin peel targeting dark spots, melasma, and acne discoloration — with visible results in as little as one week and no downtime.',
    searchDescription:
      'Pigment Peel multi-acid PCA Skin formula targets melasma, dark spots, and post-acne discoloration — visible results in as little as one week with no downtime.',
    keywords: ['pigment peel burbank', 'melasma peel', 'dark spots chemical peel', 'post acne discoloration peel', 'pca skin pigment', 'hyperpigmentation peel'],
    highlights: [
      { icon: '', title: 'Targets melasma and post-acne discoloration directly', body: 'The Pigment Peel formula is designed specifically for stubborn pigmentation concerns including melasma and the discoloration left by healed acne lesions.' },
      { icon: '', title: 'Multi-acid synergistic formula', body: 'Several brightening acids work together in the formula, each addressing pigmentation through a different mechanism for a more comprehensive result than single-acid alternatives.' },
      { icon: '', title: 'Visible results in as little as one week', body: 'Patients typically notice measurable improvement in the evenness and brightness of their skin tone within seven days of treatment as cellular renewal completes.' },
      { icon: '', title: 'No downtime required', body: 'The Pigment Peel is formulated to deliver meaningful pigmentation improvement without requiring a recovery period, making it practical for active schedules.' },
      { icon: '', title: 'PCA Skin medical-grade professional formula', body: 'The peel uses PCA Skin\'s professional-grade ingredient concentrations, validated for both efficacy and tolerability across skin types.' },
    ],
    treats: ['Melasma', 'Dark Spots', 'Post-Acne Discoloration', 'Sun Damage', 'Uneven Pigmentation', 'Hyperpigmentation'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The Pigment Peel combines multiple acids that work synergistically to disrupt melanin production pathways at different layers of the skin. The formula accelerates the removal of pigmented surface cells through chemical exfoliation while the brightening active ingredients inhibit tyrosinase — the enzyme responsible for melanin synthesis — reducing the formation of new discoloration below the surface. The combination of removal and inhibition makes it more effective for chronic pigmentation concerns like melasma and post-inflammatory hyperpigmentation than approaches that address only one mechanism.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['melasma peel', 'dark spot peel', 'brown spots treatment', 'hyperpigmentation peel', 'post-acne mark treatment', 'skin discoloration peel'],
  },
  {
    id: 'b-complex-injection',
    slug: 'b-complex-injection',
    name: 'B-Complex Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'Six essential B vitamins delivered by injection to boost energy, support immunity and metabolism, and promote healthy skin and hair.',
    searchDescription:
      'B-Complex 100 injection delivers six essential B vitamins directly into the bloodstream to boost energy, support immunity, and promote healthy skin and hair.',
    keywords: ['b complex injection burbank', 'vitamin b shot', 'energy injection', 'b12 injection', 'b vitamin iv therapy', 'metabolism boost injection'],
    highlights: [
      { icon: '', title: 'Six essential B vitamins in a single injection', body: 'B-Complex 100 delivers B1 (thiamine), B2 (riboflavin), B3 (niacin), B5 (pantothenic acid), B6 (pyridoxine), and B12 (cyanocobalamin) in one intramuscular injection.' },
      { icon: '', title: 'Boosts energy and metabolism', body: 'B vitamins are essential cofactors in mitochondrial energy production and metabolic enzyme function, supporting cellular energy availability throughout the body.' },
      { icon: '', title: 'Supports nerve and cardiovascular function', body: 'B vitamins — particularly B1, B6, and B12 — play critical roles in nerve health and in the metabolic pathways that regulate homocysteine levels relevant to cardiovascular function.' },
      { icon: '', title: 'Promotes healthy skin and hair', body: 'B vitamins including biotin and niacin support the health of skin cells and hair follicles, contributing to improved skin quality and hair strength with regular supplementation.' },
      { icon: '', title: 'Fast absorption via injection vs. oral supplements', body: 'Intramuscular injection bypasses gastrointestinal absorption limitations, delivering B vitamins directly into the bloodstream at higher bioavailability than oral supplementation.' },
    ],
    treats: ['Low Energy', 'Fatigue', 'Slow Metabolism', 'Immune Deficiency', 'Skin & Hair Health', 'Nerve Support'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'B-Complex 100 delivers a concentrated blend of B1, B2, B3, B5, B6, and B12 directly into the bloodstream via intramuscular injection, bypassing the absorption limitations of oral supplementation. B vitamins function as essential cofactors in hundreds of enzymatic reactions involved in cellular energy production, the synthesis of neurotransmitters, the metabolism of carbohydrates, fats, and proteins, and the maintenance of nerve and cardiovascular health. Deficiencies in one or more B vitamins — common due to dietary insufficiency, medication effects, or gastrointestinal absorption issues — can manifest as fatigue, cognitive changes, and poor skin and hair quality that respond well to direct supplementation.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['b12 shot', 'energy shot', 'vitamin b injection', 'metabolism shot', 'fatigue injection', 'energy boost injection'],
  },
  {
    id: 'glutathione-injection',
    slug: 'glutathione-injection',
    name: 'Glutathione Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'Powerful antioxidant injection that protects cells from oxidative stress, boosts immunity, supports skin elasticity, and reduces melanin for a more luminous complexion.',
    searchDescription:
      'Glutathione antioxidant injection neutralizes oxidative stress, boosts immune function, supports skin elasticity, and reduces melanin for a brighter complexion.',
    keywords: ['glutathione injection burbank', 'antioxidant injection', 'skin brightening injection', 'glutathione iv therapy', 'immune boost injection', 'skin lightening injection'],
    highlights: [
      { icon: '', title: 'Master antioxidant with systemic benefits', body: 'Glutathione is the body\'s primary intracellular antioxidant, present in virtually every cell and responsible for coordinating the body\'s oxidative defense system.' },
      { icon: '', title: 'Neutralizes oxidative stress and free radicals', body: 'Glutathione directly reduces reactive oxygen species that damage cellular structures including DNA, proteins, and lipid membranes — slowing oxidative cellular aging.' },
      { icon: '', title: 'Boosts immune system function', body: 'Glutathione supports T-cell proliferation and natural killer cell activity, enhancing the immune system\'s capacity to respond to pathogens and abnormal cells.' },
      { icon: '', title: 'Supports skin elasticity', body: 'By reducing oxidative damage to collagen and elastin fibers, glutathione helps preserve the structural proteins responsible for skin firmness and elasticity.' },
      { icon: '', title: 'Reduces melanin for a brighter complexion', body: 'Glutathione inhibits tyrosinase activity, shifting melanin production toward lighter eumelanin pathways and reducing the overall melanin content of the skin over a series of sessions.' },
    ],
    treats: ['Oxidative Stress', 'Immune Deficiency', 'Skin Dullness', 'Hyperpigmentation', 'Cellular Aging', 'Skin Elasticity'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Glutathione is the body\'s primary intracellular antioxidant, responsible for neutralizing free radicals, supporting immune cell function, and regulating melanin synthesis. Oral glutathione is poorly absorbed due to its breakdown in the gastrointestinal tract, while injection delivers it to therapeutic levels in the bloodstream more reliably. Once absorbed into cells, glutathione donates electrons to neutralize reactive oxygen species, regenerates other antioxidants including vitamin C and E, and maintains the reducing environment required for proper protein function. Its inhibition of tyrosinase — the enzyme initiating melanin production — contributes to progressive brightening of the complexion with consistent use.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['glow shot', 'skin brightening injection', 'antioxidant shot', 'skin lightening injection', 'immunity injection', 'glass skin injection'],
  },
  {
    id: 'mic-blend-injection',
    slug: 'mic-blend-injection',
    name: 'MIC Blend Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'Methionine, inositol, and choline promote liver fat breakdown and boost metabolism — supporting hormone regulation and mood while accelerating the body\'s natural fat disposal processes.',
    searchDescription:
      'MIC Blend injection of methionine, inositol, and choline supports liver fat processing, boosts metabolism, and improves hormonal balance and mood.',
    keywords: ['mic blend injection', 'lipotropic injection burbank', 'methionine inositol choline', 'fat metabolism injection', 'hormonal balance injection', 'liver health injection'],
    highlights: [
      { icon: '', title: 'MIC triple compound formula', body: 'Methionine, inositol, and choline form a well-established lipotropic combination, each contributing a distinct mechanism to support hepatic fat processing and metabolic function.' },
      { icon: '', title: 'Promotes hepatic fat breakdown and clearance', body: 'The MIC compounds work together to support the liver\'s ability to identify, process, and export accumulated tissue deposits for use as energy.' },
      { icon: '', title: 'Supports hormone balance', body: 'Inositol plays a role in insulin signaling and hormonal regulation, with established benefits for conditions involving hormonal imbalance including PCOS-related metabolic dysfunction.' },
      { icon: '', title: 'Improves mood and wellbeing', body: 'Inositol is involved in serotonin and dopamine signaling pathways; patients on a regular MIC Blend series sometimes report improvement in mood alongside metabolic benefits.' },
      { icon: '', title: 'Boosts metabolic fat processing comprehensively', body: 'By addressing three distinct steps in the hepatic fat processing pathway, the MIC Blend supports a more comprehensive metabolic response than single-compound approaches.' },
    ],
    treats: ['Fat Metabolism', 'Liver Fat Accumulation', 'Hormonal Imbalance', 'Mood & Energy', 'Metabolic Support', 'Weight Management'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The MIC Blend delivers methionine (an essential amino acid that prevents accumulation in the liver and converts existing deposits to usable energy), inositol (which improves insulin signaling, lipid metabolism, and plays a role in serotonin and dopamine pathways), and choline (which transports processed deposits out of the liver and into the bloodstream for energy use). Together they form a targeted lipotropic combination that supports the body\'s natural fat disposal and hormonal regulation systems. Each compound addresses a different step in the hepatic fat processing pathway, making the combination more comprehensive than any of the three compounds individually.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['fat burner shot', 'lipotropic shot', 'metabolism injection', 'slim shot', 'hormonal balance shot', 'liver detox injection'],
  },
  {
    id: 'lipotropic-plus',
    slug: 'lipotropic-plus',
    name: 'Lipotropic Plus Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'Concentrated B vitamins and amino acids to enhance hepatic fat metabolism and support liver detoxification — promoting healthy fat distribution and overall metabolic wellness.',
    searchDescription:
      'Lipotropic Plus injection of concentrated B vitamins and amino acids supports hepatic fat metabolism, liver detoxification, and overall metabolic wellness.',
    keywords: ['lipotropic plus injection', 'liver detox injection', 'fat metabolism burbank', 'lipotropic vitamin injection', 'b vitamin amino acid injection', 'metabolic wellness injection'],
    highlights: [
      { icon: '', title: 'Concentrated B vitamins and amino acids', body: 'Lipotropic Plus delivers a therapeutic-level blend of methionine, inositol, choline, and B vitamins at concentrations that support measurable metabolic improvement.' },
      { icon: '', title: 'Enhances hepatic fat metabolism', body: 'The lipotropic compounds directly support the liver\'s enzymatic pathways involved in processing and clearing accumulated tissue, reducing the burden on hepatic function.' },
      { icon: '', title: 'Supports liver detoxification', body: 'The amino acid components assist in conjugation and elimination of metabolic waste products through the liver\'s phase II detoxification pathways.' },
      { icon: '', title: 'Promotes healthy fat distribution', body: 'Regular Lipotropic Plus injections support the body\'s ability to redistribute and utilize stored energy deposits more efficiently over time.' },
      { icon: '', title: 'Overall metabolic support', body: 'Beyond targeted fat metabolism, the B vitamin component supports broad metabolic function including energy production, cellular repair, and neurotransmitter synthesis.' },
    ],
    treats: ['Fat Metabolism', 'Liver Health', 'Metabolic Sluggishness', 'Fat Distribution', 'Energy Production', 'Detoxification'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Lipotropic Plus delivers a concentrated blend of methionine, inositol, choline, and B vitamins that support the liver\'s ability to process and eliminate accumulated tissue deposits. Methionine is an essential amino acid that prevents the buildup of unwanted deposits in the liver and assists in their conversion to usable energy. Inositol improves insulin signaling and lipid metabolism at the cellular level. Choline facilitates the transport of processed deposits out of the liver and into the bloodstream for use as energy. Together with the B vitamin component, these compounds support a comprehensive metabolic environment more conducive to healthy body composition.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['lipo shot', 'fat burning shot', 'weight loss injection', 'liver detox shot', 'metabolism boost shot', 'slim injection'],
  },
  {
    id: 'ultraburn-injection',
    slug: 'ultraburn-injection',
    name: 'UltraBurn Lipotropic Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'B vitamins and chromium formulation that supports fat-burning pathways, regulates blood sugar, and aids muscle recovery and sustained energy production.',
    searchDescription:
      'UltraBurn lipotropic injection of B vitamins and chromium supports fat-burning pathways, regulates blood sugar, and aids muscle recovery and sustained energy.',
    keywords: ['ultraburn injection', 'lipotropic b vitamin shot', 'chromium injection', 'fat burning injection burbank', 'blood sugar injection', 'muscle recovery injection'],
    highlights: [
      { icon: '', title: 'B vitamins plus chromium for blood sugar regulation', body: 'Chromium picolinate enhances insulin sensitivity and supports stable blood glucose levels, reducing the fluctuations that drive energy crashes and cravings.' },
      { icon: '', title: 'Supports fat-burning metabolic pathways', body: 'The lipotropic B vitamin component activates the enzymatic pathways through which the body mobilizes and oxidizes stored tissue for energy.' },
      { icon: '', title: 'Supports muscle recovery after exercise', body: 'B vitamins and chromium both play roles in muscle glycogen synthesis and protein metabolism, supporting recovery from physical activity and lean tissue maintenance.' },
      { icon: '', title: 'Reduces fatigue and supports sustained energy', body: 'By stabilizing blood glucose and supporting mitochondrial energy production, UltraBurn helps reduce the fatigue that can undermine consistent exercise and dietary adherence.' },
      { icon: '', title: 'Promotes weight management when combined with lifestyle', body: 'UltraBurn is most effective as a metabolic support tool alongside a balanced nutrition plan and regular physical activity, not as a standalone intervention.' },
    ],
    treats: ['Fat Burning', 'Blood Sugar Regulation', 'Fatigue', 'Muscle Recovery', 'Metabolism', 'Weight Management'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'UltraBurn combines lipotropic B vitamins with chromium picolinate, a mineral that enhances insulin receptor sensitivity and improves glucose uptake into muscle cells. Together, these compounds support more efficient energy utilization, stabilize blood sugar fluctuations that drive fatigue and cravings, and activate hepatic pathways involved in mobilizing stored tissue for energy use. The B vitamin component also supports post-exercise recovery by contributing to muscle glycogen synthesis and protein metabolism. UltraBurn is most effective as a metabolic adjunct when paired with consistent nutrition and exercise.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['fat burner injection', 'energy fat shot', 'blood sugar shot', 'muscle recovery injection', 'weight management shot', 'chromium injection'],
  },
  {
    id: 'ic-lipolean',
    slug: 'ic-lipolean',
    name: 'IC LipoLean Injection',
    category: 'IV Therapy & Injections',
    tagline:
      'Lipotropic blend that accelerates metabolic fat processing, boosts metabolism, and helps curb cravings — with visible results in as little as two weeks when paired with a healthy lifestyle.',
    searchDescription:
      'IC LipoLean lipotropic injection accelerates metabolic fat processing, boosts metabolism, and reduces food cravings — visible results in two weeks with lifestyle support.',
    keywords: ['ic lipolean injection', 'lipolean burbank', 'appetite suppression injection', 'metabolism boost shot', 'lipotropic weight loss injection', 'fat processing injection'],
    highlights: [
      { icon: '', title: 'Accelerates metabolic fat processing', body: 'IC LipoLean contains lipotropic compounds that support the liver\'s role in mobilizing and processing stored deposits for energy use, working alongside a healthy lifestyle.' },
      { icon: '', title: 'Boosts overall metabolic rate', body: 'The lipotropic blend supports enzymatic pathways involved in metabolic function, helping increase the rate at which the body processes and utilizes stored energy.' },
      { icon: '', title: 'Helps reduce food cravings', body: 'Certain compounds in the LipoLean formula support neurotransmitter pathways associated with appetite regulation, contributing to reduced cravings when used as part of a comprehensive approach.' },
      { icon: '', title: 'Visible results within two weeks', body: 'Patients who pair IC LipoLean injections with a balanced diet and regular activity typically begin noticing metabolic and energy improvements within two weeks of starting a treatment series.' },
      { icon: '', title: 'Supports liver detoxification pathways', body: 'Lipotropic compounds support hepatic function and the liver\'s ability to process waste products and metabolic byproducts, contributing to overall wellness.' },
    ],
    treats: ['Slow Metabolism', 'Weight Management', 'Fat Accumulation', 'Food Cravings', 'Liver Detox Support', 'Energy Levels'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'IC LipoLean combines lipotropic compounds that support the liver\'s role in processing and mobilizing stored tissue for energy use. The formula helps facilitate the transport of accumulated deposits from the liver into the bloodstream where they can be used as fuel, while also supporting the hepatic detoxification pathways responsible for clearing metabolic waste. The craving-reduction component supports appetite regulation through neurotransmitter pathway support. Results are most significant when the injection series is combined with a balanced diet and regular physical activity that creates the conditions for the mobilized energy to be utilized.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['lipo shot', 'weight loss shot', 'appetite suppression injection', 'fat burning injection', 'craving control shot', 'metabolism injection'],
  },
  {
    id: 'bpc-157',
    slug: 'bpc-157',
    name: 'BPC-157 Peptide Therapy',
    category: 'Peptide & Anti-Aging Therapy',
    tagline:
      'Regenerative peptide that accelerates tissue and joint repair, reduces inflammation, and supports gut health — promoting faster recovery and improved mobility across multiple tissue types.',
    searchDescription:
      'BPC-157 peptide accelerates tissue and joint repair, reduces systemic inflammation, and supports gut health — promoting faster recovery across multiple tissue types.',
    keywords: ['bpc 157 burbank', 'peptide therapy', 'joint repair peptide', 'tissue healing injection', 'gut health peptide', 'inflammation peptide therapy'],
    highlights: [
      { icon: '', title: 'Accelerates tissue and joint repair', body: 'BPC-157 has demonstrated consistent tissue-healing properties across tendons, ligaments, muscle, and bone in research settings, accelerating the recovery timeline for injuries and overuse conditions.' },
      { icon: '', title: 'Reduces systemic inflammation', body: 'BPC-157 modulates multiple inflammatory signaling pathways, reducing pro-inflammatory cytokines and supporting a more controlled healing response throughout the body.' },
      { icon: '', title: 'Supports gut lining integrity', body: 'BPC-157 was originally identified for its gastric protective properties; it supports the integrity of the gastrointestinal mucosal lining and promotes healing of inflammatory gut conditions.' },
      { icon: '', title: 'Improves mobility and recovery time', body: 'By accelerating the repair of connective tissue and reducing inflammation at injury sites, BPC-157 supports faster return to full mobility and reduced post-exercise recovery time.' },
      { icon: '', title: 'Versatile healing peptide with broad tissue applicability', body: 'BPC-157\'s healing effects have been observed across diverse tissue types — musculoskeletal, gastrointestinal, vascular, and neurological — making it a versatile addition to a comprehensive wellness protocol.' },
    ],
    treats: ['Joint Pain', 'Tissue Injury', 'Inflammation', 'Gut Health', 'Post-Exercise Recovery', 'Wound Healing'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'BPC-157 (Body Protection Compound) is a pentadecapeptide derived from a protein found in gastric juice. It promotes angiogenesis through vascular endothelial growth factor (VEGF) pathways, modulates nitric oxide synthesis to improve blood flow and reduce oxidative stress, and activates growth hormone receptor signaling in musculoskeletal tissue — accelerating healing in tendons, ligaments, muscle, and cartilage. Its gastric origin confers direct protective effects on the gastrointestinal lining, making it effective for inflammatory gut conditions. The anti-inflammatory effects are mediated through reduction of pro-inflammatory cytokine activity, contributing to a more controlled and efficient healing response throughout the body.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['healing peptide', 'joint repair peptide', 'gut healing peptide', 'anti-inflammatory peptide', 'tissue repair injection', 'body protection compound'],
  },
  {
    id: 'ghk-cu-copper-peptide',
    slug: 'ghk-cu-copper-peptide',
    name: 'GHK-Cu Copper Peptide Therapy',
    category: 'Peptide & Anti-Aging Therapy',
    tagline:
      'GHK-Cu copper peptide stimulates collagen, repairs DNA, promotes blood vessel regrowth, and supports hair follicle health — delivering comprehensive cellular repair and rejuvenation.',
    searchDescription:
      'GHK-Cu copper peptide therapy stimulates collagen, repairs DNA, promotes angiogenesis, and supports hair follicle health — comprehensive cellular rejuvenation.',
    keywords: ['ghk cu peptide', 'copper peptide therapy burbank', 'collagen peptide injection', 'dna repair peptide', 'hair follicle peptide', 'cellular rejuvenation injection'],
    highlights: [
      { icon: '', title: 'Stimulates collagen and elastin production', body: 'GHK-Cu activates fibroblasts to produce collagen type I, III, and IV, as well as elastin, supporting structural tissue integrity throughout the body.' },
      { icon: '', title: 'Supports DNA repair mechanisms', body: 'GHK-Cu upregulates genes involved in DNA repair and antioxidant enzyme systems, contributing to improved cellular integrity and reduced age-related DNA damage accumulation.' },
      { icon: '', title: 'Promotes angiogenesis — new blood vessel formation', body: 'GHK-Cu promotes the formation of new blood vessels in target tissues, improving circulation and nutrient delivery to skin, hair follicles, and healing tissue.' },
      { icon: '', title: 'Supports hair follicle health and growth', body: 'The angiogenic and growth-factor-activating properties of GHK-Cu make it a valuable adjunct for hair restoration protocols, supporting follicle vascularity and activity.' },
      { icon: '', title: 'Broad systemic cellular benefits', body: 'GHK-Cu influences the expression of over 4,000 human genes, affecting pathways involved in tissue repair, inflammation regulation, and cellular metabolism.' },
    ],
    treats: ['Collagen Loss', 'DNA Damage', 'Poor Wound Healing', 'Hair Loss', 'Skin Aging', 'Cellular Decline'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'GHK-Cu (glycyl-L-histidyl-L-lysine copper) is a naturally occurring copper peptide complex that declines significantly with age. It activates collagen and elastin synthesis by stimulating fibroblasts, upregulates antioxidant enzyme systems to reduce oxidative cellular damage, promotes angiogenesis through vascular endothelial growth factor pathways, and activates DNA repair enzymes. Research has demonstrated that GHK-Cu influences the expression of over 4,000 human genes, with broad effects on tissue repair, anti-inflammatory signaling, hair follicle cycling, and cellular metabolic function — delivering regenerative effects across skin, hair, and systemic tissue in a single peptide compound.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['copper peptide', 'anti-aging peptide', 'collagen peptide', 'glow peptide', 'dna repair peptide', 'hair growth peptide'],
  },
  {
    id: 'sermorelin',
    slug: 'sermorelin',
    name: 'Sermorelin Peptide Therapy',
    category: 'Peptide & Anti-Aging Therapy',
    tagline:
      'Synthetic peptide that stimulates the body\'s natural growth hormone production — supporting lean muscle, collagen synthesis, sleep quality, and mental clarity through the body\'s own biology.',
    searchDescription:
      'Sermorelin GHRH analogue stimulates the pituitary to produce natural growth hormone — supporting lean muscle, collagen, sleep quality, and mental clarity without synthetic HGH.',
    keywords: ['sermorelin burbank', 'growth hormone therapy', 'ghrh peptide', 'hgh alternative', 'sermorelin injections', 'anti aging peptide therapy'],
    highlights: [
      { icon: '', title: 'Stimulates natural HGH — not synthetic replacement', body: 'Sermorelin works by signaling the pituitary gland to produce and release more of the body\'s own growth hormone, preserving the natural feedback regulation that synthetic HGH bypasses.' },
      { icon: '', title: 'Supports lean muscle and body composition', body: 'Growth hormone plays a direct role in muscle protein synthesis and the preferential use of stored tissue for energy, supporting improved body composition over time.' },
      { icon: '', title: 'Stimulates collagen synthesis throughout the body', body: 'HGH stimulates fibroblast activity and collagen production, contributing to improvements in skin firmness, connective tissue strength, and overall tissue quality.' },
      { icon: '', title: 'Improves sleep quality and recovery', body: 'Growth hormone is primarily secreted during deep sleep stages; restoring HGH levels tends to improve sleep depth and the restorative quality of rest.' },
      { icon: '', title: 'Enhances mental clarity and energy levels', body: 'Growth hormone has neurological effects including improved cognitive function, mood regulation, and energy availability that patients frequently report as among the most noticeable benefits.' },
    ],
    treats: ['HGH Decline', 'Low Energy', 'Muscle Loss', 'Collagen Depletion', 'Poor Sleep', 'Mental Fog'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Sermorelin is a growth hormone releasing hormone (GHRH) analogue that signals the pituitary gland to produce and release more of the body\'s own growth hormone through the natural somatotropic axis. Unlike synthetic HGH, which bypasses this regulatory system entirely, Sermorelin works within the body\'s existing feedback mechanisms — meaning the pituitary still responds to somatostatin signals that prevent excessive HGH production. This makes it a physiologically safer approach to addressing the age-related decline in growth hormone that underlies many of the changes in body composition, sleep quality, skin quality, and cognitive function experienced in middle and later adulthood.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['natural hgh', 'growth hormone booster', 'hgh alternative', 'anti-aging hormone therapy', 'muscle building peptide', 'sleep improvement injection'],
  },
  {
    id: 'nad-therapy',
    slug: 'nad-therapy',
    name: 'NAD+ IV Therapy',
    category: 'IV Therapy & Injections',
    tagline:
      'Replenishes NAD+ to boost cellular energy, enhance mental clarity, and support DNA repair — with anti-aging benefits including improved sleep and reduced inflammation.',
    searchDescription:
      'NAD IV infusion replenishes NAD+ to boost cellular energy production, support DNA repair, enhance mental clarity, and reduce inflammation — delivered at therapeutic concentration.',
    keywords: ['nad iv therapy burbank', 'nad infusion', 'cellular energy iv', 'nad plus injection', 'anti aging iv therapy', 'nicotinamide adenine dinucleotide'],
    highlights: [
      { icon: '', title: 'Replenishes declining NAD+ levels directly', body: 'NAD+ levels drop significantly with age — IV infusion restores them to levels that oral supplementation cannot reliably achieve, due to absorption limitations.' },
      { icon: '', title: 'Boosts mitochondrial energy production', body: 'NAD+ is a critical substrate in the electron transport chain; restoring cellular NAD+ directly supports the mitochondria\'s ability to produce ATP for energy.' },
      { icon: '', title: 'Supports DNA repair mechanisms', body: 'NAD+ is required by PARP enzymes, which detect and repair DNA strand breaks — a fundamental cellular maintenance process that depends on adequate NAD+ availability.' },
      { icon: '', title: 'Improves mental clarity and cognitive function', body: 'NAD+ plays a role in neuronal health and sirtuins activity; patients frequently report improved focus, mental clarity, and mood following a series of infusions.' },
      { icon: '', title: 'Reduces cellular inflammation and improves sleep', body: 'NAD+-dependent pathways regulate inflammatory signaling and circadian rhythm function, contributing to reported improvements in systemic inflammation and sleep quality.' },
    ],
    treats: ['Cellular Energy Decline', 'Mental Fog', 'Poor Sleep', 'Inflammation', 'DNA Damage', 'Age-Related Fatigue'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme essential to cellular energy metabolism that declines by approximately 50% between the ages of 40 and 60. IV infusion delivers NAD+ directly into the bloodstream at therapeutic concentrations, replenishing cellular stores that oral precursors cannot fully restore due to conversion inefficiency. Once inside the cell, NAD+ serves as a substrate for sirtuins (longevity-regulating proteins), PARP enzymes (DNA repair), and the mitochondrial electron transport chain (energy production). The infusion is administered over two to four hours to optimize tolerance and cellular uptake.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['nad drip', 'anti-aging iv', 'energy iv drip', 'brain fog iv', 'longevity drip', 'cellular energy infusion', 'nad plus therapy'],
  },
  {
    id: 'weight-loss-consultation',
    slug: 'weight-loss-consultation',
    name: 'Weight Loss Consultation',
    category: 'Weight Loss',
    tagline:
      'Comprehensive evaluation for medically supervised weight loss — personalized plans built around your health history, goals, and lifestyle, complimentary for new patients.',
    searchDescription:
      'Medical weight loss consultation — comprehensive evaluation for a personalized, medically supervised weight loss protocol, complimentary for new patients.',
    keywords: ['weight loss consultation burbank', 'medical weight loss', 'glp1 consultation', 'free weight loss consultation', 'supervised weight loss', 'weight loss doctor burbank'],
    highlights: [
      { icon: '', title: 'Comprehensive health history evaluation', body: 'The consultation reviews your complete health history including existing conditions, current medications, previous weight loss attempts, and relevant labs to inform the appropriate protocol.' },
      { icon: '', title: 'Fully personalized treatment plan', body: 'No two protocols are identical — the plan developed reflects your specific metabolic status, health constraints, lifestyle, and goals rather than a standardized template.' },
      { icon: '', title: 'No one-size-fits-all protocols', body: 'Factors including hormonal status, medication interactions, comorbidities, and weight history all influence which approach will be both safe and effective for a given patient.' },
      { icon: '', title: 'Complimentary for new patients', body: 'The initial medical weight loss consultation is provided at no charge for new patients, removing the financial barrier to getting the information needed to make an informed decision.' },
      { icon: '', title: 'First step toward lasting results', body: 'The consultation is the foundation of the entire program — the quality of the evaluation directly influences the appropriateness and effectiveness of everything that follows.' },
    ],
    treats: ['Weight Management Planning', 'Health History Review', 'Goal Setting', 'Lifestyle Assessment', 'Metabolic Evaluation', 'Treatment Planning'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The consultation is a thorough one-on-one evaluation of your health history, current metabolic status, weight history, and personal goals. The provider uses this information to determine the most appropriate medically supervised weight loss protocol — whether that involves GLP-1 medications, lifestyle interventions, or a combined approach tailored specifically to your physiology and circumstances. The consultation is complimentary for new patients and serves as the foundation for building a plan that is both medically sound and realistic for your individual situation.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['weight loss doctor visit', 'medical weight consult', 'free weight loss consultation', 'glp1 consultation', 'supervised weight loss eval'],
  },
  {
    id: 'weight-loss-program',
    slug: 'weight-loss-program',
    name: 'Weight Loss Program',
    category: 'Weight Loss',
    tagline:
      'FDA-approved weight loss injections combined with personalized diet and lifestyle guidance — medically supervised and tailored to your health history and goals for sustainable results.',
    searchDescription:
      'Medical weight loss program using FDA-approved GLP-1 medications combined with personalized nutrition and lifestyle guidance — medically supervised for sustainable results.',
    keywords: ['weight loss program burbank', 'glp1 weight loss', 'semaglutide burbank', 'tirzepatide burbank', 'medical weight loss program', 'supervised weight loss program'],
    highlights: [
      { icon: '', title: 'FDA-approved medications with a strong clinical record', body: 'The program incorporates FDA-approved GLP-1 receptor agonist medications that have demonstrated consistent efficacy in clinical trials for meaningful, sustained weight reduction.' },
      { icon: '', title: 'Medically supervised for safety and effectiveness', body: 'A qualified provider monitors progress, adjusts dosing, and addresses any side effects throughout the program — ensuring the protocol remains appropriate as the body responds.' },
      { icon: '', title: 'Personalized to your health history', body: 'The protocol is developed around an individual evaluation of existing conditions, medications, metabolic status, and health history — not a standardized one-size-fits-all approach.' },
      { icon: '', title: 'Combines medication with lifestyle guidance', body: 'The program pairs pharmaceutical support with practical nutrition and lifestyle recommendations, creating sustainable behavioral changes alongside the physiological effects of medication.' },
      { icon: '', title: 'Designed for sustainable long-term results', body: 'The emphasis throughout is on building the conditions for lasting change, rather than rapid short-term loss that is regained when medication is discontinued.' },
    ],
    treats: ['Excess Weight', 'Metabolic Dysfunction', 'Insulin Resistance', 'Appetite Regulation', 'Body Composition', 'Cardiometabolic Risk'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'The program combines FDA-approved GLP-1 receptor agonist medications with a structured nutrition and lifestyle plan developed around each patient\'s individual health history. GLP-1 medications work by mimicking the incretin hormones that regulate appetite, slow gastric emptying, and improve insulin sensitivity — reducing caloric intake through both physiological appetite suppression and improved metabolic efficiency. Regular medical supervision ensures the protocol is adjusted as the body responds, providing a safe and personalized pathway to meaningful, sustainable weight reduction that addresses the underlying metabolic factors rather than relying solely on behavioral restriction.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['semaglutide', 'tirzepatide', 'ozempic alternative', 'wegovy alternative', 'glp-1 program', 'weight loss injections', 'medical weight loss'],
  },
  {
    id: 'cherry-payment-plans',
    slug: 'cherry-payment-plans',
    name: 'Cherry Payment Plans',
    category: 'Financing',
    tagline:
      'Flexible treatment financing with no impact to your credit score to apply — get pre-approved for a payment plan that fits your budget, risk-free, fast, and easy.',
    searchDescription:
      'Cherry payment plans allow patients to finance any treatment at Magnolia Skin Center with no credit score impact to apply — flexible terms, fast approval.',
    keywords: ['cherry financing', 'medical financing burbank', 'aesthetic payment plans', 'cherry pay', 'treatment financing', 'no credit check aesthetic financing'],
    highlights: [
      { icon: '', title: 'Applying does not impact your credit score', body: 'Cherry uses a soft credit inquiry for pre-qualification, meaning checking your eligibility will not affect your credit score in any way.' },
      { icon: '', title: 'Fast pre-approval process', body: 'The application takes minutes to complete, and most applicants receive a pre-approval decision quickly — with no lengthy waiting period.' },
      { icon: '', title: 'Flexible payment terms to fit your budget', body: 'Cherry offers a range of repayment terms, allowing patients to select the monthly payment structure that fits their financial situation.' },
      { icon: '', title: 'Covers any treatment on the menu', body: 'Cherry financing can be applied toward any service offered at Magnolia Skin Center — including aesthetic treatments, wellness services, memberships, and packages.' },
      { icon: '', title: 'No financial barrier to starting care', body: 'Cherry is designed specifically for healthcare and aesthetic practices to ensure patients can access the treatment they need without being limited by upfront cost.' },
    ],
    treats: ['Any Aesthetic Treatment', 'Any Wellness Service', 'Multiple Treatments Together', 'Membership Fees', 'Treatment Packages', 'Consultation Fees'],
    howItWorks: [
      {
        step: '1',
        title: 'How It Works',
        body: 'Cherry is a patient financing platform that allows clients to split their treatment costs into manageable monthly payments. Applying takes minutes and does not affect your credit score. Upon approval, the credit can be applied toward any service or membership at Magnolia Skin Center — making it easy to start the treatment plan that is right for you without financial delay. Cherry\'s terms are transparent and the process is straightforward, with no hidden fees or surprises in the repayment structure.',
      },
    ],
    disclaimer: DISCLAIMER,
    alsoKnownAs: ['pay monthly', 'treatment financing', 'aesthetic payment plan', 'no credit check financing', 'split treatment cost', 'pay over time'],
  },
]

export function getServiceBySlug(slug: string): ServiceEntry | undefined {
  return SERVICES.find(s => s.slug === slug)
}
export function getServiceById(id: string): ServiceEntry | undefined {
  return SERVICES.find(s => s.id === id)
}

export function getServicesByCategory(category: string): ServiceEntry[] {
  return SERVICES.filter(s => s.category === category)
}

export function getAllSlugs(): string[] {
  return SERVICES.map(s => s.slug)
}
