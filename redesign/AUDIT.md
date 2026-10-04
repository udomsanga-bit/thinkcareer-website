# ThinkCareer website — audit, critique, redesign (Oct 2026)

## 1. Key finding
Two different sites exist. The **committed/live** site (React + i18n, EN/Khmer) is accurate and on-brand. The **uncommitted rewrite** (`index.html`, `about.html`, `coaching.html`, `success-stories.html`) is a generic "executive" template. **Do not deploy the rewrite as-is.**

## 2. Critical issues (fix before anything ships)
| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | "LSE alumnus" — your degree is MA, London Metropolitan University | index, about | Use "MA, London Metropolitan University" |
| 2 | "Alumni and partners: LSE, McKinsey, World Bank, UNESCO"; "alumni lead at Google, Goldman, Meta…" — unverifiable logo walls | index, success-stories | Remove; show only real clients/partners with permission |
| 3 | Fabricated outcomes: "+25% salary", "$140k+ equity", "Senior Director → VP" case study, counters showing "+0%" | index FAQ, success-stories | Remove until real, consented testimonials exist |
| 4 | Pricing conflicts with real offer ($499 / $1,299 vs $150 / $450 / on request) | index | Use real pricing |
| 5 | Audience drift: "executives, board-level, Fortune 500" vs. Cambodian students and young professionals | all pages | Re-anchor on grads and 0–5 yrs |
| 6 | Khmer language dropped | all pages | Keep EN/KM toggle |
| 7 | Contact form not wired (no handler); wrong email `hello@thinkcareers.com`; "London" address; © 2024 | index | Post to `/api/contact`; correct details; © 2026 |
| 8 | "Certified Executive Coach" — unverified | index | Remove unless true |

## 3. UX / UI critique
| Area | Current | Recommendation |
|---|---|---|
| Hero | Strong line, but "Elite / ambitious leaders" copy and a pulsing "Next intake opening soon" with no date | Keep line; add price + free-call micro-copy; real credential chips |
| Navigation | "Programs" anchor, 3 extra pages that duplicate home | One page + anchors; add language toggle |
| Social proof | None that is real | Add 3 consented quotes (name, role, outcome) when available |
| Photo | Same portrait used twice; Gemini sparkle watermark bottom-right | Crop (done) or replace; use a second, different photo |
| Brand | Rewrite uses Tailwind default greens/greys; logo mark absent; live site uses navy/sage/cream/gold | Return to logo palette; add the គិត mark |
| Accessibility | Muted text #6B7A94 on cream = 3.8:1 (fail); sage text on cream = 1.8:1; no skip link; placeholder-led labels; motion not gated everywhere | Muted → #4A5873 (6.3:1); sage only as fill or on navy (5.4:1); skip link; visible labels; `prefers-reduced-motion` |
| Performance | Tailwind CDN + in-browser Babel/React in production; 940 KB cv-builder | Static HTML/CSS (this redesign: ~50 KB, no framework) |
| SEO | Live site is blank without JS (noscript only) | Static content (done) |
| Forms | Generic fields | Stage + program selects, inline errors, consent, honeypot, success state |
| Conversion | Many "Enroll Now" buttons before any conversation | Single path: free 20-min call; stage cards prefill form |

## 4. UX copy review
| Before | After | Why |
|---|---|---|
| "Elite Career Strategy" | "Think. Plan. Lead." | Matches brand, drops elitism |
| "Enroll Now" / "Apply for Intake" | "Enquire about The Launchpad" | Low-pressure, consistent verb |
| "Submit your inquiry… review your profile for program suitability" | "Free 20-minute intake call, no pitch." | Plain, human |
| "Send Inquiry" | "Send enquiry" + "personal reply from Udom" | Sets expectation |
| "Work Email / john@company.com" | "Email / you@domain.com" | Students have no work email |
| "Early Career / Mid-Level / Senior" | "Final-year student / 0–1 / 2–4 / 5+ yrs" | Fits real audience |
| Inconsistent: Udom Vathy / Vuthy; ThinkCareer / ThinkCareers | **Udom Vuthy**, **ThinkCareer** | One name everywhere |

## 5. What the redesign does
- Single static page, EN/ខ្មែរ toggle, brand palette from the logo (navy, sage, cream, gold).
- Sections: hero → "Where are you?" stage cards → 3 pillars → programs ($150 / $450 / on request) → CV Builder → founder → how it starts → FAQ → enquiry form.
- WCAG: contrast ≥ 4.5:1 for text, skip link, focus rings, 44px+ targets, reduced-motion, labelled form with inline errors.

## 6. Open items for Adam
1. **Khmer review:** new strings (keys `n_*`) were written by Claude; existing strings reused from `i18n.js`.
2. Confirm "12+ years in HR" can be shown publicly (and whether to name employers).
3. Confirm CV Builder is free/public before adding "free" to the CTA.
4. Telegram link `https://t.me/thinkcareer` is a placeholder — set the real channel URL.
5. Add real testimonials, a second photo, and a Privacy Policy page.
6. Fix portrait watermark in the original `assets/hero-portrait.jpg`.
