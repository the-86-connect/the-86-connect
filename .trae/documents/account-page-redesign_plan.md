# Account Page Redesign: Tab-Based Layout

## Summary

Redesign the user account page (`/account`) from a single long scroll into a **two-tab layout** so that:
- **Submissions are the first priority** (default tab)
- **Edit name, change password, export data, and delete account** are grouped under a separate "Settings" tab

This matches the user's request: *"delete and password and edit name should be in a different tab or something and submission is the first priority."*

## Current State Analysis

**File:** [frontend/src/app/account/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/account/page.tsx) (~870 lines)

The page is currently a single vertical scroll with sections in this order:
1. Back link (line 430)
2. Header — name, email, logout button (line 439)
3. Stats — 3 cards: Submissions / Study / Sourcing (line 464)
4. **Profile Card** — name/email/phone + inline edit form (line 507) ← "edit name" lives here
5. **Submissions list** (line 612) ← currently NOT first
6. Quick Actions — links to start new applications (line 667)
7. **Security — Change Password** (line 714)
8. **Danger Zone — Export & Delete Account** (line 840)

**Relevant infrastructure found:**
- No shadcn `Tabs` component installed in [frontend/src/components/ui/](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/components/ui/)
- Admin page already uses a `useState<TabType>` + URL hash sync pattern at [admin/page.tsx:384-399](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/admin/page.tsx#L384-L399) — we follow this convention
- Glass design system classes available in [globals.css](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/globals.css): `.glass-card`, `.glass-card-hover`, `.btn-glass`, `.btn-glass-danger`
- Account layout ([account/layout.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/account/layout.tsx)) is bare — returns `children` only, no Navbar/Footer wrapper
- All existing state, handlers, and helper functions (`handleSaveProfile`, `handleChangePassword`, `handleExportData`, `handleDeleteAccount`, `downloadUserDataDoc`, `SubmissionCard`, etc.) stay unchanged — only the JSX layout is reorganized

## Proposed Changes

**Only one file is modified:** [frontend/src/app/account/page.tsx](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/account/page.tsx)

No new files, no new dependencies, no backend changes.

### Step 1: Add tab state + URL hash sync

Add a `TabType` union and `activeTab` state inside `AccountPage`, mirroring the admin page pattern.

```tsx
type AccountTab = "submissions" | "settings";
// ...
const [activeTab, setActiveTab] = useState<AccountTab>("submissions");

// Sync with URL hash so refresh/back button preserves the active tab
useEffect(() => {
  const hash = window.location.hash.replace("#", "");
  if (hash === "settings" || hash === "submissions") {
    setActiveTab(hash);
  }
}, []);

const switchTab = (tab: AccountTab) => {
  setActiveTab(tab);
  window.location.hash = tab;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

Default tab is `"submissions"` — fulfilling "submission is the first priority".

### Step 2: Render a horizontal tab bar below the header

Insert a pill-style tab bar between the Header (line 462) and the Stats section (line 464). Uses glass design tokens already in the project.

```tsx
{/* Tab bar */}
<div className="mb-8 inline-flex p-1 rounded-2xl glass-card">
  <button
    type="button"
    onClick={() => switchTab("submissions")}
    className={cn(
      "inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer",
      activeTab === "submissions"
        ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    <Inbox className="h-4 w-4" />
    My Submissions
  </button>
  <button
    type="button"
    onClick={() => switchTab("settings")}
    className={cn(
      "inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer",
      activeTab === "settings"
        ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    <Settings className="h-4 w-4" />
    Settings
  </button>
</div>
```

`Settings` icon is imported from `lucide-react` (add to the existing import block at line 7). The active state uses the same red gradient as the admin sidebar active items (per project memory: "from-primary to-red-700 with white text and shadow").

### Step 3: Reorganize the body into two conditional blocks

Wrap the existing sections in `{activeTab === "submissions" && (...)}` / `{activeTab === "settings" && (...)}`. **No section's internal JSX is rewritten** — only its wrapper changes.

#### Tab 1: "submissions" (default — first priority)
Contains, in this order:
1. Stats (3 cards) — currently lines 464–505
2. Submissions list — currently lines 612–665
3. Quick Actions — currently lines 667–712

#### Tab 2: "settings"
Contains, in this order:
1. Profile Card (edit name/phone) — currently lines 507–610
2. Security — Change Password — currently lines 714–838
3. Danger Zone — Export & Delete — currently lines 840–960

This is the cleanest grouping: identity-edit, credential-change, and data-lifehcycle all live together under Settings; the activity view (submissions) becomes the landing experience.

### Step 4: Keep the header persistent across both tabs

The Header block (lines 439–462 — avatar, name, email, logout button) stays **outside** both tab conditionals, immediately above the tab bar. Logout should always be reachable regardless of active tab.

The Back link (lines 430–437) also stays above the tab bar.

## Assumptions & Decisions

1. **Two tabs, not three.** The user said "delete and password and edit name should be in a different tab." All three are account-management actions, so they belong together in one Settings tab. Splitting into Profile/Security/Danger tabs would over-fragment a simple account page.
2. **Submissions tab is default.** Directly satisfies "submission is the first priority." Users land on their activity, not their settings.
3. **URL hash sync (`#submissions` / `#settings`).** Matches the existing admin page convention at [admin/page.tsx:386-399](file:///e:/PYTHON PROJECT UNI/The 86 Connect/frontend/src/app/admin/page.tsx#L386-L399). Enables deep-linking, browser back button, and refresh-preserves-state.
4. **No shadcn Tabs component installed.** A 2-tab layout doesn't justify adding a dependency. A custom pill bar with `useState` matches the admin page pattern and the glass design system.
5. **Quick Actions stay under Submissions tab** (not Settings) because they're about creating new submissions, which thematically belongs with the submissions list.
6. **Stats stay under Submissions tab** because they're submission counts — contextual to the submissions list, not to settings.
7. **No backend, API, or type changes.** All existing handlers (`handleSaveProfile`, `handleChangePassword`, `handleExportData`, `handleDeleteAccount`) and helpers (`downloadUserDataDoc`, `SubmissionCard`, `formatDate`) are reused verbatim.
8. **Mobile responsiveness:** The tab bar uses `inline-flex` with two short labels, so it fits comfortably on phone widths without wrapping. Touch targets are `h-10` (40px) — slightly under the project's 44px convention, so bump to `h-11` in implementation to match the project's mobile touch-target rule.

## Verification

1. **Type check:** `cd frontend; npx tsc --noEmit` — must pass with zero errors
2. **Manual test — Submissions tab (default):**
   - Visit `/account` → lands on Submissions tab
   - Stats cards visible
   - Submissions list visible (or empty-state with CTAs)
   - Quick Actions visible
   - Profile/Password/Delete sections NOT visible
3. **Manual test — Settings tab:**
   - Click "Settings" → URL becomes `/account#settings`
   - Profile Card visible with edit form
   - Change Password section visible
   - Export Data + Delete Account visible
   - Submissions/Stats/Quick Actions NOT visible
4. **Manual test — persistence:**
   - On Settings tab, refresh page → stays on Settings
   - Browser back button returns to Submissions tab
5. **Manual test — functionality preserved:**
   - Edit name + save → still works
   - Change password → still works
   - Export My Data → still downloads `.doc`
   - Delete account flow → still works
   - Logout button → still works from both tabs
6. **Mobile check:** Tab bar fits on a 375px viewport without wrapping; both tabs reachable; active state clearly visible.
