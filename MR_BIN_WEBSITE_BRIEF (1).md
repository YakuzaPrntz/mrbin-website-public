# Mr.Bin — Website Brief (Locked Spec)

This is the complete, stable specification. Any change to anything below
gets recorded as a dated entry in the Decision Log section of this same
file — do not let a verbal request in conversation silently override
something written here.

---

## Business Context

Mr.Bin provides residential trash bin washing, sanitizing, and deodorizing
services around Stafford, Virginia (22554) and Fredericksburg, Virginia.
Audience: busy homeowners who want to book quickly without reading much.
Assume basic technology skill — the site must be simple, clear, and easy
to use.

*(Corrected per Decision Log Entry 6 — the business is in Stafford, VA /
Fredericksburg, VA, not Stafford, TX. All Texas-area references below are
superseded.)*

## Design Goal

Clean, professional, modern, fresh, trustworthy, local, easy. Not flyer-like.
No clutter, no excessive animation, no tiny text, no overwhelming choice.

## Brand Palette — RESOLVED, see Decision Log Entries 1 and 2

Four color anchors, confirmed final:
- Deep green: `#0B6B3A` — primary buttons, heading accents
- Fresh lime accent: `#A6E22E` — CTA buttons, badges, highlights
- Navy: `#123047` — footer, dark cards, pricing card
- Fresh blue: `#1E7FC2` — icons, section labels, FAQ markers, step badges
- Off-white background: `#F7FAF6` — page background
- Charcoal text: `#1F2933` — body text

Derived/supporting tints (generated from the anchors above, not independent
decisions): `#0E3A57`, `#5C6B63`, `#EAF7DB`, `#E3F1FB`, `#F0F6EC`,
`#E8EFE6`, `#DCE6DA`, `#FBFDFA`, `#B9C6D2`, `#CBEE8C`, `#CFEBFF`, `#D6E4DD`,
`#CFE3D8`, `#6E7E8C`.

The earlier "blue and green instead" request is resolved as: blue is a
fourth anchor pulled from the logo's water-splash detail, layered onto the
original green/lime/navy palette — not a replacement of it.

## Design Requirements

- Mobile-first layout
- Large buttons
- Simple language, simple reading level
- Clear visual hierarchy
- Strong call-to-action above the fold
- Rounded cards, clean icons, plenty of white space
- Booking process should feel fast
- No long paragraphs
- Short trust-building sections

---

## Website Sections

### 1. Hero
- Headline: "Dirty Bins? Mr.Bin Cleans Them Fast."
- Subheadline: "Trash bin washing, sanitizing, and deodorizing for busy
  homeowners in Stafford and Fredericksburg, Virginia."
- Eyebrow badge: "Now serving Stafford & Fredericksburg"
- Primary button: "Book Bin Cleaning"
- Secondary button: "See Pricing"
- A clean, professional image/illustration placeholder of a sparkling trash
  bin — not cartoon-heavy.

### 2. Quick Benefit Bar
- Removes bad odors
- Helps reduce germs
- Keeps bugs away
- Saves you time

### 3. How It Works (3 steps)
1. Put your bins outside
2. We wash, sanitize, and deodorize
3. Enjoy clean, fresh bins

### 4. Pricing
- One-Time Wash: $XX per bin
- Monthly Plan: $XX per month
- Add-On Bin: $XX
- Note: "Final pricing can be confirmed when booking."

### 5. Why Homeowners Choose Mr.Bin
- Local service
- Fast scheduling
- No need to be home
- Cleaner bins without extra work

### 6. Service Area
- Text: "Serving Stafford and Fredericksburg, Virginia."
- Area badges: "Stafford" / "Fredericksburg" only.
- Map: interactive Google Map with a shaded service-area boundary
  (approximate polygon covering Stafford, VA 22554 and Fredericksburg, VA),
  centered on Stafford as the home base. Google Maps API key restricted to
  the production domain; injected at build time via Cloudflare Pages env var
  (see Decision Log Entry 12).

### 7. Booking Form

Fields: Name, Phone number, Email, Address, Number of bins, Preferred
service date, Notes.
- Button: "Request My Cleaning"
- After form: "We'll text or call to confirm your appointment."

*(Email field added per Decision Log Entry 9 — required so an automated
customer-confirmation email can be sent. Not in the original brief.)*

### 8. FAQ
- **Do I need to be home?** No. Just leave your bins accessible on your
  service day.
- **How long does it take?** Most cleanings are quick and completed outside.
- **What do you clean?** Residential trash bins and recycling bins.
- **Is the cleaning safe?** Yes. We use a bin-safe washing and deodorizing
  process.

### 9. Footer
- Mr.Bin
- Trash Bin Washing Service
- Stafford, VA and nearby areas
- Phone: (571) 589-5542
- Instagram: @mrbinllc — https://www.instagram.com/mrbinllc/
- Facebook: Mr.Bin — https://www.facebook.com/profile.php?id=61591574605342
- TikTok: @mrbinllc — https://www.tiktok.com/@mrbinllc
- Button: "Book Now"

---

## Infrastructure (added — not part of the original design brief)

- **Domain**: `MrBinusa.com`, registered through Cloudflare.
- **DNS / hosting**: Cloudflare Pages, deployed from a connected GitHub
  repository (`YakuzaPrntz/mrbin-website`, private).
- **Backend logic** (booking form submission): Cloudflare Pages Functions
  (Worker at `/api/book`).
- **Booking data storage**: Cloudflare D1 (`mrbin-bookings` database).
  Every submission is logged to the database regardless of whether the
  owner-notification step succeeds.
- **Owner notification**: Telegram bot message sent on each new booking,
  triggered by the same Worker that writes to D1. Bot token and chat ID
  stored as Cloudflare Pages secrets.
- **Customer notification**: Confirmation email sent via Resend to the
  email address provided at booking. Resend API key stored as a Cloudflare
  Pages secret.
- **Build tool**: Claude Code, building from this locked brief and the
  finished 3-page Claude Design prototype as the visual reference.
- **Cost posture**: free tier across all Cloudflare components at expected
  volume; paid tier acceptable as a fallback if needed.
- **Explicitly out of scope for this phase**: online payment processing
  (noted as a possible future phase — the data model should not actively
  block adding a payment-status field later, but no payment integration is
  being built now). An admin dashboard for viewing/managing bookings is
  also deferred until real booking volume clarifies what's actually needed.

---

## Local SEO Notes (added)

- Google Business Profile should be set up directly with Google (separate
  from the website codebase).
- The website itself should include correct page titles/descriptions,
  `LocalBusiness` structured data (schema.org), and the service-area text
  as real page content (not only inside an image or map widget), so the
  business is findable for searches like "trash bin washing" in the
  Stafford/Fredericksburg, VA area.

---

## Conversion Psychology Requirements

- One main action throughout: booking
- Reduce decision fatigue
- Short sections
- Repeat the booking button after major sections
- Easy-to-compare pricing
- Clear, direct text
- Trust signals without overwhelming the visitor

---

## Decision Log

1. **Palette contradiction (green/lime/navy vs. blue/green)** — RESOLVED.
   Blue is a fourth anchor, not a replacement. See Brand Palette section
   above.
2. **Full palette specification** — RESOLVED. Four anchors plus derived
   tints, as documented above.
3. **Logo** — RESOLVED. Present and correctly placed (header, footer) in
   the locked Claude Design prototype.
4. **Design prototype lock** — RESOLVED. All 3 pages of the Claude Design
   prototype ("Mr.Bin Desktop") are final and serve as the visual reference
   for the Claude Code build.
5. **Infrastructure** — RESOLVED. See Infrastructure section above.
6. **Domain** — RESOLVED. MrBinusa.com.
7. **Service location** — RESOLVED. Stafford, VA (22554) and
   Fredericksburg, VA. This corrects every earlier reference to Stafford,
   TX / Sugar Land / Missouri City / southwest Houston, which was a
   genuine error, not a refinement.
8. **Booking notification architecture** — RESOLVED. Owner notified via
   Telegram bot message; customer notified via confirmation email sent
   through Resend. No SMS/Twilio for this phase.
9. **Booking form Email field** — RESOLVED (June 27, 2026). An Email field
   was added to the booking form (see Section 7 above), since the original
   field list had no way to deliver the customer-confirmation email decided
   in Entry 8. This is a real addition to the locked spec, not an oversight
   being silently patched. Email field sits between Phone number and Address
   in the form layout.
10. **Google Maps integration** — RESOLVED (June 27, 2026). Maps JavaScript
    API integrated in Milestone 5. Key stored as Cloudflare Pages env var
    `GOOGLE_MAPS_API_KEY`; injected into `main.js` at build time by
    `build.sh` (build command: `sh build.sh`). Token `__GOOGLE_MAPS_API_KEY__`
    is the placeholder in git. Service area is a single hand-approximated
    polygon over Stafford VA (22554) + Fredericksburg VA, in brand colors
    (lime fill #A6E22E at 25% opacity, deep-green stroke #0B6B3A).
11. **Real business phone number** — RESOLVED (June 27, 2026). (571) 589-5542.
    Replaces the (XXX) XXX-XXXX placeholder in header, footer, schema.org,
    and the header `tel:` href. Form input placeholder changed to the neutral
    format example "(555) 555-5555" (using the real number there would be
    confusing as a fill-in-the-blank hint).
12. **Real social media handles** — RESOLVED (June 27, 2026). Instagram
    @mrbinllc, Facebook Mr.Bin (numeric profile URL), TikTok @mrbinllc.
    All three added as linked text in the footer contact block. schema.org
    `sameAs` updated to include all three URLs. Replaces the @MrBin
    placeholder.
13. **Maps API key delivery mechanism** — RESOLVED (June 27, 2026). Dropped
    the public `/api/maps-key` endpoint originally built in Milestone 5;
    key is injected directly into `main.js` at build time instead, keeping
    the literal key out of git history (see Entry 10).

## Open Items (do not silently resolve — log first)

1. A desktop-specific layout variant was mentioned in an earlier session
   (more horizontal, logo centered at top) but the request was cut off
   mid-sentence and never fully specified. The current locked prototype
   ("Mr.Bin Desktop," 3 pages) may already satisfy this — needs explicit
   confirmation rather than assumption either way.
2. Resend sending domain: `mrBinusa.com` must be verified in the Resend
   dashboard (DNS records: SPF, DKIM, DMARC) before customer confirmation
   emails will deliver. This is a manual step in the Resend dashboard,
   separate from any code change.
3. Pricing placeholders ($XX) remain on the live site — real prices not
   yet provided.
