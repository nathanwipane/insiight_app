# CONTEXT.md — Insiight App

Working context for the Next.js 16 console. This is a snapshot — verify against current code before acting on anything time-sensitive.

---

## 1. Component structure

All components live under `components/`. Every client component is marked `"use client"`.

### `components/layout/`
- `DashboardShell.tsx` — client — wraps dashboard pages; mounts Sidebar + TopBar + main, owns sidebar collapse state.
- `Sidebar.tsx` — client — fixed left rail (52 / 224 px). Logo with dynamic org initials + name, `<OrgSwitcher>`, nav items, user avatar, sign-out.
- `OrgSwitcher.tsx` — client — superadmin-only org dropdown. Hidden when sidebar is collapsed.
- `TopBar.tsx` — client — breadcrumb row derived from URL segments.

### `components/auth/`
- `AuthButton.tsx` — submit button with "authenticating…" state.
- `AuthDivider.tsx` — horizontal "OR" divider.
- `AuthHeading.tsx` — client — terminal-style heading with blinking cursor.
- `AuthInput.tsx` — labeled input.
- `register/StepUserDetails.tsx` — client — step 1 (name / email / password / confirm), MetaPixel tracking.
- `register/StepOrgDetails.tsx` — client — step 2 (company / size / industry).
- `register/StepUserRole.tsx` — client — step 3 (role picker), MetaPixel tracking.

### `components/providers/`
- `AuthProvider.tsx` — client — wraps `SessionProvider` from `next-auth/react`.

### `components/dashboard/variants/`
- `AgencyDashboard.tsx`, `BrandDashboard.tsx`, `MediaOwnerDashboard.tsx` — all return `null` (placeholders).

### `components/campaigns/`
- `CampaignStatusBadge.tsx` — client — Active / Scheduled / Completed / Draft pill. Owns `STATUS_CONFIG`.
- `CampaignsTable.tsx` — client — TanStack Table; sortable/paginated. Columns: Campaign, Status, Client, Progress, Impressions, Period, Actions. Gated by `PermissionGuard`.
- `CampaignsTableSkeleton.tsx` — client — loading skeleton mirror of the table.
- `CampaignMetricCard.tsx` — client — single metric tile (label / value / delta / sub-label).
- `GanttTimeline.tsx` — client — 1M / 6M / 1Y timeline view; re-uses `STATUS_CONFIG`.
- `EditCampaignModal.tsx` — client — modal shell; implementation incomplete.

### `components/campaigns/detail/`
- `CampaignDetailHeader.tsx` — client — outer tabs (Dashboard / Proof Of Play / Reports) + title / status / dates / progress / download / share.
- `CampaignInnerTabs.tsx` — client — inner tab switcher (Performance / Audience / Creative / Insights AI).
- `CampaignOverviewCard.tsx` — client — area chart + AI summary.
- `CampaignSummaryCard.tsx` — client — collapsible AI summary.
- `CampaignTimeseriesCard.tsx` — client — impressions-over-time area chart.
- `CampaignMetricsRow.tsx` — client — row of metric cards with AI-insight toggle.
- `CampaignStatCards.tsx` — client — grid of stat cards (impressions / reach / clicks / CTR / plays).
- `CampaignAISummary.tsx` — client — collapsible AI bullets.
- `CampaignGalleryQuickview.tsx` — client — proof-of-play preview strip.
- `RankedBarList.tsx` — client — ranked bars with deltas / graduated coloring.
- `SectionCard.tsx` — client — titled card container with body slot.
- `tabs/CampaignPerformanceTab.tsx` — client — timeseries + ranked location/platform.
- `tabs/AudienceInsightsTab.tsx` — client — demographics (age / gender / income), ranked bars.
- `tabs/CreativeBreakdownTab.tsx` — client — creative performance charts.
- `tabs/InsightsAITab.tsx` — client — strengths / opportunities / watch-outs cards.
- `tabs/ProofOfPlayTab.tsx` — client — photo gallery with location + date.
- `tabs/ReportsTab.tsx` — client — PCR / newsletter download.

### Other
- `components/PermissionGuard.tsx` — conditional render by permission(s); supports `requireAll`, `fallback`, `loading`. Exports `usePermissionGuard` hook.
- `components/shared/VersionLabel.tsx` — small version pill.
- `components/ui/SelectDropdown.tsx` — client — custom select w/ outside-click close.
- `components/ui/SignInLoader.tsx` — empty.

---

## 2. Token system

Imported in `app/layout.tsx`:
```
@/styles/globals.css
@/styles/tokens/base.css
@/styles/tokens/insiight.css
```

`base.css` defines semantic `--color-*`, `--font-*`, `--radius-*` that alias `--brand-*` (indirection for future themes). `insiight.css` supplies the concrete brand values.

### `styles/tokens/base.css` — semantic aliases
```
--color-primary         → --brand-primary
--color-primary-subtle  → --brand-primary-subtle
--color-bg              → --brand-bg
--color-surface         → --brand-surface
--color-surface-alt     → --brand-surface-alt
--color-border          → --brand-border
--color-border-subtle   → --brand-border-subtle
--color-text            → --brand-text
--color-text-secondary  → --brand-text-secondary
--color-text-muted      → --brand-text-muted
--color-text-disabled   → --brand-text-disabled
--color-success         → --brand-success
--font-sans             → --brand-font-sans
--font-mono             → --brand-font-mono
--radius-sm|md|lg       → --brand-radius-sm|md|lg
```

### `styles/tokens/insiight.css` — brand values
```
--brand-primary:         #ad46ff
--brand-primary-subtle:  #f5f0ff
--brand-bg:              #f8f9fa
--brand-surface:         #ffffff
--brand-surface-alt:     #fafafa
--brand-border:          #e5e7eb
--brand-border-subtle:   #f3f4f6
--brand-text:            #0f1117
--brand-text-secondary:  #374151
--brand-text-muted:      #9ca3af
--brand-text-disabled:   #d1d5db
--brand-success:         #34d399
--brand-font-sans:       var(--font-geist-sans)
--brand-font-mono:       var(--font-geist-mono)
--brand-radius-sm:       4px
--brand-radius-md:       6px
--brand-radius-lg:       8px

--status-active-bg:      #dcfce7    --status-active-text:     #16a34a
--status-scheduled-bg:   #dbeafe    --status-scheduled-text:  #1d4ed8
--status-completed-bg:   #ede9fe    --status-completed-text:  #7c3aed
--status-draft-bg:       #f9fafb    --status-draft-text:      #9ca3af
```

**No dark mode / theme switcher in the repo.** The indirection layer exists but isn't wired up.

**Styling convention**: layout via Tailwind utility classes; colors / radii / fonts via inline `style={{ … var(--…) }}` — never raw hex in components.

---

## 3. Auth Flow

- All users authenticate via a single global signin page at `/signin`.
- Branch B (org-specific tenant login) has been removed entirely.
- `authenticateUser()` in `lib/auth.ts` is deprecated, not called anywhere.
- All auth goes through `getUserAndParentFromCommon()` → `sm_common_users`.
- JWT payload includes: `email`, `parent_org_id`, `role_id`, `org_id`, `user_id`, `org_name`, `permissions`, `org_type`.
- JWT expiry: **5h hard, no refresh**.
- NextAuth `pages` config: `signIn → /signin` only.
- Org boundary check lives in `app/(console)/[parent_org_id]/dashboard/layout.tsx`.
- `jwt` callback handles `trigger === "update"` for org switching — decodes the new JWT and merges `parent_org_id`, `org_id`, `org_name`, `permissions`, and the new `jwt` back into `token.user`.

### Stack
- **NextAuth v5 beta** (`next-auth@5.0.0-beta.30`).
- **Next 16** uses `proxy.ts` instead of `middleware.ts` (file convention rename). See `AGENTS.md`: *"This is NOT the Next.js you know."*
- External backend at `API_BASE_URL` owns users / orgs / permissions. No local DB, no RLS in this repo.
- Per-tenant backend DB: `insiight_{parent_org_id}_db`.

### Entry points
- `proxy.ts` — matcher excludes `/api`, `/_next/static`, `/_next/image`, `/favicon.ico`, `/signin`, `/register`.
- `lib/authOptions.ts` — NextAuth config: Credentials + Google providers, JWT signing, callbacks.
- `app/api/auth/[...nextauth]/route.ts` — handler re-export (`GET`, `POST`).
- `components/providers/AuthProvider.tsx` — wraps app in `SessionProvider`.

### Role → permissions (`constants/config.ts`)
Permission catalog:
```
campaigns:{view,create,edit,share}
assets:{view,create,edit,share}
plans:{view,create,edit,share}
team:{view,add_remove}
organisation:{view,add_remove}
audience_plan:{view,edit}
```
Roles: Superadmin / Media Owner Admin (both full), Media Owner User, Media Agency Admin, Media Agency User, Sales Rep (see `constants/config.ts:32-62` for exact subsets).

### Permission checks (client-side only)
- `hooks/usePermissions.ts` — `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `isRole` over `session.user.permissions`.
- `components/PermissionGuard.tsx` — conditional render wrapper.
- `hooks/usePermissionsBasedNavigation.ts` — filters sidebar items.

### Org boundary
Enforced in exactly one place — `app/(console)/[parent_org_id]/dashboard/layout.tsx`:
```ts
const decoded = jwt.verify(user.jwt, process.env.JWT_SECRET as string);
if (decoded.exp < currentTime || decoded.parent_org_id !== parent_org_id) {
  redirect("/signin?expired=true");
}
```
Sibling `(console)` routes outside `/dashboard` do not re-validate.

---

## 4. Org Switcher

- **Superadmin only** (`role_id === 1`); hidden when sidebar is collapsed.
- Fetches org list from `GET /v2/get-all-organisations` via shared SWR key `["/v2/get-all-organisations", token]` (Sidebar's org-name lookup reuses the same key → no extra request).
- Renders **active orgs** as clickable rows; **inactive orgs** aggregated into a single greyed "_N inactive organisation(s)_" label at the bottom.
- Dropdown opens to the **right of the chevron** (`position: fixed`, `z-index: 9999`) so it escapes the sidebar's `overflow: hidden`.
- On switch:
  - `POST /v2/create-jwt-token` with body `{ email, parent_org_id, role_id, org_id, user_id, permissions, org_name }` and the current JWT as Bearer.
  - Response `{ status: true, data: { access_token: "..." } }`.
  - Calls NextAuth `update({ jwt: data.data.access_token })` → the `jwt` callback's `trigger === "update"` path merges the decoded payload into `token.user`.
  - **Hard navigates via `window.location.href = '/${orgId}/dashboard'`** so the new session cookie is read server-side before the layout runs.
- Org name + 2-letter initials shown in the Sidebar header come from `session.user.org_name`, embedded in the JWT by `authorize()` on sign-in and refreshed on switch.

---

## 5. v2 API Endpoints

- **`GET /v2/get-all-organisations`** → `controllers_v2/Organisations/getAllOrganisationsV2.js` (in `insiight_web_api`).
  - Queries `insiight_clients.sm_clients_info`, excludes `client_id = 'insiight'`.
  - Returns: `{ status: true, data: Organisation[] }` where `Organisation = { id, client_id, client_name, logo?, status?, db_name? }`.

- **`POST /v2/create-jwt-token`** → `controllers_v2/Authentication/createJwtTokenV2.js` (in `insiight_web_api`).
  - Body: `{ email, parent_org_id, role_id, org_id, user_id, permissions, org_name }`.
  - Returns: `{ status: true, data: { access_token, token_type, payload, message } }`.
  - **Note:** no expiry on tokens issued by this endpoint — diverges from the 5h expiry of sign-in-minted JWTs.

---

## 6. Deleted / Deprecated

- `app/(console)/[parent_org_id]/auth/` — **deleted** (was all stubs: `layout.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `signup/page.tsx`, plus a previously-deleted `signin/page.tsx`).
- `authenticateUser()` in `lib/auth.ts` — **deprecated**, safe to delete. Marked with a `// DEPRECATED` comment; no call sites remain.
- Branch B (org-specific credential login) — **removed** from `authOptions.ts`: the `parent_org_id` credential field, the `if/else` branch, and the `authenticateUser` import are all gone.
- NextAuth `pages.signOut` / `pages.newUser` — **removed**; only `signIn: '/signin'` remains.
- Forgot-password link on the signin page — **disabled**; now a non-clickable "Forgot password? (coming soon)" span.

---

## 7. Pending Work

### Must-fix before deploy
1. **Hardcoded test credentials** — `lib/authOptions.ts:21-38`. `test@test.com` / `Amplify123!` with full permissions. Delete before any public deploy.
2. **`JWT_SECRET` / `NEXTAUTH_SECRET`** — committed in `.env.local`. Rotate and move to a secret manager.
3. **Google OAuth provider** — wired in `lib/authOptions.ts` but the `signIn` callback returns `false` for non-credentials. Either implement or remove.

### New / follow-up
4. **Forgot password flow** — global `/forgot-password` route not built; signin page currently shows "coming soon" placeholder.
5. **Registration email verification** — `app/(auth)/register/create-profile/page.tsx:140` fetches `/api/auth/decode-verification-token`, which doesn't exist in the repo.
6. **`org_type` not in v2 JWT** — `createJwtTokenV2` does not sign `org_type` into the token, so switching orgs drops it from `session.user.org_type`. Sign-in-minted tokens still have it.
7. **`authenticateUser()` cleanup** — deprecated; delete after confirming no external references.
8. **Server-side permission enforcement** — all RBAC is still client-side (`usePermissions` / `PermissionGuard`). Backend must validate independently.
9. **JWT refresh / session extension** — no refresh token flow; users are bounced to `/signin` after 5h (or whenever a sign-in-minted token expires; v2 tokens have no expiry by contrast).

### Structural gaps
10. **Org boundary check only in `/dashboard`** — other `(console)/[parent_org_id]/*` routes (campaigns, settings, etc.) don't re-validate.
11. **NextAuth session type not augmented** — no `types/next-auth.d.ts`; access to `user.jwt`, `permissions`, `org_name`, etc. is via `as any` / `as User` casts.

### Port-forwards from prior project (`app/(console)/[parent_org_id]/dashboard/layout.tsx:8-18`)
- `TourWrapper`, `WelcomeModalProvider`, `DemoProvider` / `DemoAutoLogin` / `DemoCredentialsWrapper` / `DemoBanner`, `PoweredByInsiight`.
- Providers: `ParentOrgProvider`, `FilterProvider`, `CampaignDataProvider`, `CampaignPlannerProvider`, `AgencyPlannerProvider`.

### In-flight / incomplete
- `components/campaigns/EditCampaignModal.tsx` — shell only.
- `AddCampaignModal` referenced in `app/(console)/[parent_org_id]/dashboard/campaigns/(list)/page.tsx:307` — commented TODO.
- `lib/testData/index.ts:1` — "add assets.ts, dashboard.ts as pages are built".
- Dashboard variants (`AgencyDashboard`, `BrandDashboard`, `MediaOwnerDashboard`) all return `null`.

### Code quality
- ESLint: ~60 problems (errors + warnings). Clusters: `no-explicit-any`, `prefer-const`, unused vars, `no-wrapper-object-types`.
- TypeScript `tsc --noEmit`: clean.

---

## 8. Key architectural decisions

- **Next 16 conventions.** `proxy.ts` replaces `middleware.ts`; read `node_modules/next/dist/docs/` before writing Next code (per `AGENTS.md`).
- **Flat multi-tenancy.** Route param is `[parent_org_id]` but there's no parent/child hierarchy — it's a tenant slug generated from org name via `lib/utils.ts`. Each tenant has its own backend DB.
- **External backend as source of truth.** No Prisma, no Supabase, no migrations in-repo. All CRUD goes through `https://api.insiightanalytics.com/api` with JWT Bearer auth.
- **JWT-embedded permissions + org_name.** Identity and org context travel in the token payload rather than being re-fetched per request. Cheap reads; stale on role/name change until re-login or org-switch.
- **Client-side RBAC, server-side trust required.** UI gates via `usePermissions` / `PermissionGuard`; enforcement is the backend's job.
- **Styling split.** Tailwind for layout utilities; inline `style` objects using CSS custom properties for anything themeable. Keeps components dark-mode-ready even though dark mode isn't implemented.
- **SWR for client data.** Shared `fetcher` in `lib/swrFetchers.ts`; keys use `[url, token]` tuples so auth changes invalidate cache and different consumers share one request.
- **Credentials-only auth (effectively).** Google provider configured but disabled in the `signIn` callback — only email + password via bcrypt against the backend.
- **Single global signin.** `/signin` is the one entry point; tenant-specific auth routes have been deleted.
- **Org-switch uses hard navigation.** After `update({ jwt })`, we `window.location.href = '/${orgId}/dashboard'` so the new session cookie is picked up server-side before the layout's boundary check runs.
- **Org boundary enforced at layout level, not middleware.** The `proxy.ts` matcher only checks "is there a session"; the `parent_org_id` match check lives in `app/(console)/[parent_org_id]/dashboard/layout.tsx`.
