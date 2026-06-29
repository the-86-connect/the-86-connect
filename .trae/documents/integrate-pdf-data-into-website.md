# Plan: Integrate PDF Data into Website (Scholarship + Company Profile)

## Summary

Two PDFs were added to the project root:
1. **`Scholarship_Advisory_Detailed.pdf`** — A 6-page detailed scholarship advisory guide for studying in China, including fees, process, requirements, scholarship types, and partner universities.
2. **`company+profile.pdf`** — A 2-page company profile for Beijing BridgePath International Consulting Co., Ltd (parent of 86Connect), covering sourcing service structure, payment framework, logistics, and value proposition.

This plan integrates the PDF content into the website as **on-page content** (not just downloadable PDFs) and fixes factual discrepancies (e.g., the about section says "Founded 2015" but the company was incorporated November 23, 2023).

---

## Phase 1: Explore — Findings

### PDF 1: Scholarship_Advisory_Detailed.pdf (Key Data NOT on Website)

| Data Point | PDF Content | Currently on Website? |
|---|---|---|
| **Company name** | Beijing BridgePath International Consulting Co., Ltd | No — about section says "86 Connect" only |
| **Application Fee** | $750 (non-refundable, covers up to 5 universities) | **No** |
| **Service/Project Fee** | $2,500–$3,500 (paid after admission + JW202) | **No** |
| **Supplementary Services** | $1,500 (airport pickup, accommodation, bank, SIM, medical, registration) | **No** |
| **Scholarship Types** | Type A (full + stipend), B (tuition + accommodation), C (tuition only), D (partial), E (first year only) | **No** — blog has different A/B types |
| **CSCA Entrance Exam** | Mandatory for undergraduate applicants | **No** |
| **Application Requirements** | 10-item document checklist | **No** |
| **Application Process** | 9-step detailed process | Partial — website has 4 simplified steps |
| **Refund Policy** | Detailed terms | **No** |
| **Partner Universities** | Top-tier (8) + Mid-tier (10) with names | Partial — website has 6 with generic info |
| **Cost of Living / Safety / Language** | Practical notes for students | **No** |

### PDF 2: company+profile.pdf (Key Data NOT on Website)

| Data Point | PDF Content | Currently on Website? |
|---|---|---|
| **Legal company name** | Beijing BridgePath International Consulting Co., Ltd | **No** |
| **Incorporated date** | November 23, 2023 | **No** — about says "Founded 2015" (WRONG) |
| **Operating region** | China + strategic presence in West Africa | **No** |
| **Service structure** | Two models: Partial-Service vs Full-Service | **No** |
| **Payment framework** | Corporate account in China, direct-to-supplier option | **No** |
| **Logistics/cost** | CBM calculation, flat-rate (duty inclusive), warehouse | **No** |
| **Revenue model** | Percentage-based consulting & handling fee | **No** |
| **Value proposition** | Transparency, Accountability, Flexibility, Efficiency, Reliability | Partial — about has different values |

### Current Website State
- [study-in-china/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/study-in-china/page.tsx) — Has hero, overview, 3 services, 6 universities, 4 process steps, video gallery, testimonials, FAQ, apply form. **No fees, no scholarship types, no CSCA, no requirements checklist.**
- [product-sourcing/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/product-sourcing/page.tsx) — Has hero, overview, 3 services, 4 process steps, categories, video gallery, testimonials, FAQ, inquiry form. **No service models, no payment framework, no logistics details.**
- [about-us.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/components/sections/about-us.tsx) — Says "Founded 2015" (incorrect), no mention of Beijing BridgePath or West Africa.
- No dedicated `/about` page exists (only homepage section).

---

## Phase 3: Proposed Changes

### A. Study-in-China Page — Add 3 New Sections

**File:** [frontend/src/app/study-in-china/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/study-in-china/page.tsx)

#### A1. Add "Fees & Pricing" section (after Services, before Universities)
- Display the fee structure from the PDF as pricing cards:
  - **Application Fee: $750** — Non-refundable, covers up to 5 universities
  - **Service Fee: $2,500–$3,500** — Paid after admission secured & JW202 issued
  - **Supplementary Services: $1,500** — Optional (airport pickup, accommodation, bank setup, SIM, medical check, school registration)
- Note that university fees (tuition, accommodation, insurance) are separate.
- Add a "Download Full Guide" button linking to the PDF.

#### A2. Add "Scholarship Types" section (after Fees)
- Display 5 scholarship types as cards:
  - Type A: Tuition + Accommodation + Monthly stipend
  - Type B: Tuition + Accommodation
  - Type C: Tuition only
  - Type D: Partial scholarship (varies)
  - Type E: Tuition covered (first year only)
- Note: Outcomes depend on academic performance, CSCA results, and application strength.

#### A3. Add "Requirements & Process" section (replace/augment current 4-step process)
- **Document Checklist** (10 items from PDF): passport photo, passport ID, transcripts, degree certificate, physical exam form, non-criminal record, English proficiency (IELTS ≥ 5.0), application form, guarantee letter (under 18), additional docs.
- **CSCA Info**: Mandatory standardized entrance exam for undergraduate applicants.
- **9-Step Application Process**: Initial consultation → Program selection → Document submission → Application fee payment → University review → Pre-admission results → Service fee payment → Admission Letter + JW202 → Visa application.
- **Refund Policy summary**: Application fee non-refundable; service fee generally non-refundable with limited exceptions.

### B. Product-Sourcing Page — Add 2 New Sections

**File:** [frontend/src/app/product-sourcing/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/product-sourcing/page.tsx)

#### B1. Add "Service Models" section (after Services, before Process)
- Two-column comparison from the PDF:
  - **Partial-Service Support**: For clients with existing suppliers. Includes factory inspections, quality assurance, logistics coordination. Client pays supplier directly.
  - **Full-Service Support**: Complete project management. Supplier identification, production inspection, procurement coordination, international logistics, customs clearance.
- Note: Every transaction governed by formal contract.

#### B2. Add "How Costs Work" section (after Process)
- **Payment Framework**: Corporate account in China for transparency; direct-to-supplier option to reduce client tax burden.
- **Logistics**: CBM (Cubic Meter) calculation at warehouse → flat-rate shipping (duty inclusive, no hidden fees). Delivery fee after local warehouse is subject to real-time conditions.
- **Revenue Model**: Percentage-based consulting & handling fee covering supplier coordination, QC, project management, logistics supervision.

### C. About-Us Section — Fix Company Info

**File:** [frontend/src/components/sections/about-us.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/components/sections/about-us.tsx)

- Change "Founded 2015" → "Incorporated November 2023"
- Add full legal name: "Beijing BridgePath International Consulting Co., Ltd"
- Add mention of West Africa strategic presence
- Add mention of digital subsidiary "86Connect"
- Update the "Our Story" text to reflect the company profile PDF content (procurement coordination, supplier management, logistics facilitation, connecting overseas clients from Africa with Chinese suppliers).
- Update the "Values" to match the PDF's value proposition: Transparency, Accountability, Flexibility, Efficiency, Reliability.

### D. Make PDFs Downloadable

**Files:** Both service pages

- Copy both PDFs to `frontend/public/pdfs/` so they're statically served.
- Add "Download Full Guide (PDF)" buttons on:
  - Study-in-China page → links to `Scholarship_Advisory_Detailed.pdf`
  - Product-Sourcing page → links to `company+profile.pdf`
- These complement (not replace) the on-page content sections above.

### E. Update Partner Universities List (Study-in-China)

**File:** [frontend/src/app/study-in-china/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/study-in-china/page.tsx)

- Update the `UNIVERSITIES` array to match the PDF's partner universities:
  - **Top-Tier** (8): Zhejiang, Shanghai Jiao Tong, Fudan, Nanjing, Wuhan, Tongji, Beihang, Xi'an Jiaotong
  - **Mid-Tier** (10): East China Normal, Beijing Language & Culture, UIBE, Nanjing Medical, Jiangsu, Zhejiang Normal, China University of Petroleum, Dalian Medical, Guangxi Medical, Liaoning
- Add a "tier" badge to each card (Top-Tier vs Higher Admission Chances).

---

## Implementation Order

1. **Copy PDFs** to `frontend/public/pdfs/` (2 files)
2. **Update about-us.tsx** — Fix company info (quick win, fixes factual error)
3. **Update study-in-china/page.tsx** — Add Fees, Scholarship Types, Requirements sections; update universities list
4. **Update product-sourcing/page.tsx** — Add Service Models and How Costs Work sections
5. **Add download buttons** to both service pages

---

## Verification Steps

1. Visit `http://localhost:3000` → About section shows "Incorporated November 2023" and "Beijing BridgePath"
2. Visit `http://localhost:3000/study-in-china` → New "Fees & Pricing" section shows $750/$2,500-$3,500/$1,500
3. Visit `http://localhost:3000/study-in-china` → "Scholarship Types" section shows Types A-E
4. Visit `http://localhost:3000/study-in-china` → Requirements checklist shows 10 items including CSCA
5. Visit `http://localhost:3000/product-sourcing` → "Service Models" section shows Partial vs Full service
6. Visit `http://localhost:3000/product-sourcing` → "How Costs Work" section shows CBM/flat-rate info
7. Download buttons work: clicking "Download Full Guide" downloads the correct PDF
8. No hydration errors in browser console
9. Pages render correctly on mobile (responsive check)

---

## Assumptions & Decisions

- **On-page content over PDF-only**: The PDF data should be displayed as readable website content (better for SEO, UX, and mobile), with PDFs as supplementary downloads.
- **Fees are public**: The PDF contains fee structures that the user wants visible on the website (not hidden behind a quote form).
- **"Founded 2015" is incorrect**: The company profile PDF states incorporation date as November 23, 2023. The about section will be corrected.
- **No new dependencies needed**: All changes are content/JSX additions to existing pages.
- **Styling matches existing patterns**: New sections will use the same card/section patterns already on the pages (rounded-3xl, shadow-soft-sm, border-border, etc.).
