# CONTEXT.md — Insiight App

Working context for the Next.js 16 console. This is a snapshot — verify against current code before acting on anything time-sensitive.

---

## 1. Component structure

All components live under `components/`. Every client component is marked `"use client"`.

### `components/layout/`
- `DashboardShell.tsx` — client — wraps dashboard pages; mounts Sidebar + TopBar + main, owns sidebar collapse state.
- `Sidebar.tsx` — client — fixed left rail (52 / 224 px). Logo, `<OrgSwitcher>`, nav items, user avatar, sign-out.
- `OrgSwitcher.tsx` — client — **new**. Superadmin-only org dropdown. Hidden when sidebar is collapsed.
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

## 3. Auth setup

### Stack
- **NextAuth v5 beta** (`next-auth@5.0.0-beta.30`).
- **Next 16** uses `proxy.ts` instead of `middleware.ts` (file convention rename). See `AGENTS.md`: *"This is NOT the Next.js you know."*
- External backend at `API_BASE_URL` owns users / orgs / permissions. No local DB, no RLS in this repo.
- Per-tenant backend DB: `insiight_{parent_org_id}_db`.

### Entry points
- `proxy.ts` — `export { auth as proxy } from "@/lib/authOptions"`; matcher excludes `/api`, `/_next/static`, `/_next/image`, `/favicon.ico`, `/signin`, `/register`.
- `lib/authOptions.ts` — NextAuth config: Credentials + Google providers, JWT signing, callbacks.
- `app/api/auth/[...nextauth]/route.ts` — handler re-export (`GET`, `POST`).
- `components/providers/AuthProvider.tsx` — wraps app in `SessionProvider`.

### JWT (`lib/authOptions.ts:72-84`)
Signed with `JWT_SECRET`. Payload:
```ts
{ email, parent_org_id, role_id, org_id, user_id, permissions, org_type }
```
Lifetime: **5h hard expiry**, no refresh. Session `sessionExpires = Date.now() + 5h`.

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
Enforced in exactly one place — `app/(console)/[parent_org_id]/dashboard/layout.tsx:38-71`:
```ts
const decoded = jwt.verify(user.jwt, process.env.JWT_SECRET as string);
if (decoded.exp < currentTime || decoded.parent_org_id !== parent_org_id) {
  redirect("/signin?expired=true");
}
```
Sibling `(console)` routes outside `/dashboard` do not re-validate.

---

## 4. Org switcher plan

### Files
- **New:** `components/layout/OrgSwitcher.tsx` (client).
- **Modified:** `components/layout/Sidebar.tsx` — imports and renders `<OrgSwitcher collapsed={collapsed} />` between the logo block and the `PanelLeft` toggle.
- **Modified:** `.env.local` — added `NEXT_PUBLIC_API_BASE_URL` (client needs it for the JWT-swap fetch).

### Flow
1. Gate: render only if `session.user.role_id === 1` (superadmin) **and** sidebar is expanded.
2. Fetch: `useSWR(["/get-all-organisations", token], fetcher)` — list of `{ parent_org_id, organisation_name, logo? }`.
3. On select:
   - `POST ${NEXT_PUBLIC_API_BASE_URL}/create-jwt-token` with body `{ parent_org_id }` and the current JWT as Bearer.
   - `await update({ jwt: data.token })` on the NextAuth session.
   - `router.push(`/${orgId}/dashboard`)`.
4. Outside-click closes dropdown (mousedown listener on `document`).

### Backend contract assumed
- `GET /get-all-organisations` returns `Organisation[]` for superadmin.
- `POST /create-jwt-token` accepts `{ parent_org_id }` + superadmin Bearer and returns `{ token }` scoped to the target org. **Not verified — needs backend confirmation before use.**

### Known defects in `OrgSwitcher.tsx`
- `currentOrg` assigned but unused.
- `style={{ … truncate: true }}` — `truncate` is not a CSS property (likely wants `overflow: "hidden"`, `textOverflow: "ellipsis"`, `whiteSpace: "nowrap"`, or a `className="truncate"`).

---

## 5. Pending work items

### Must-fix before deploy
1. **Hardcoded test credentials** — `lib/authOptions.ts:21-38`. `test@test.com` / `Amplify123!` with full permissions. Delete.
2. **`JWT_SECRET` / `NEXTAUTH_SECRET`** — committed in `.env.local`. Rotate and move to secret manager.
3. **Google OAuth provider** — wired in `lib/authOptions.ts:10-13` but `signIn` callback returns `false` for non-credentials at line 100. Either implement or remove.

### Structural gaps
4. **No server-side permission validation.** All permission logic is client-side; backend must enforce independently.
5. **No JWT refresh.** 5h hard expiry → user bounced to signin.
6. **Org boundary check only in `/dashboard`.** Other `(console)/[parent_org_id]/*` routes (campaigns, settings, etc.) don't re-validate.
7. **NextAuth session type not augmented** — no `types/next-auth.d.ts`; access to `user.jwt`, `permissions`, etc. is via casts.

### Port-forwards from prior project (`app/(console)/[parent_org_id]/dashboard/layout.tsx:8-18`)
- `TourWrapper`, `WelcomeModalProvider`, `DemoProvider` / `DemoAutoLogin` / `DemoCredentialsWrapper` / `DemoBanner`, `PoweredByInsiight`.
- Providers: `ParentOrgProvider`, `FilterProvider`, `CampaignDataProvider`, `CampaignPlannerProvider`, `AgencyPlannerProvider`.

### In-flight / incomplete
- `components/campaigns/EditCampaignModal.tsx` — shell only.
- `AddCampaignModal` referenced in `app/(console)/[parent_org_id]/dashboard/campaigns/(list)/page.tsx:307` — commented TODO.
- `lib/testData/index.ts:1` — "add assets.ts, dashboard.ts as pages are built".
- Dashboard variants (`AgencyDashboard`, `BrandDashboard`, `MediaOwnerDashboard`) all return `null`.

### Code quality
- ESLint: ~60 problems (31 errors, ~28 warnings). Clusters: `no-explicit-any` (`lib/database.ts`, `lib/linkedIn.ts`, `lib/metaPixel.ts`, `hooks/usePermissionsBasedNavigation.ts`), `prefer-const`, unused vars (`axios`, `getUserByEmail`, `userReal`, `res`, `title`, `collapsed`), `no-wrapper-object-types` (`lib/users.ts`).
- TypeScript `tsc --noEmit`: clean.

---

## 6. Key architectural decisions

- **Next 16 conventions.** `proxy.ts` replaces `middleware.ts`; read `node_modules/next/dist/docs/` before writing Next code (per `AGENTS.md`).
- **Flat multi-tenancy.** Route param is `[parent_org_id]` but there's no parent/child hierarchy — it's a tenant slug, generated from org name via `lib/utils.ts` (first 8 alphabetic chars, lowercased). Each tenant has its own backend DB.
- **External backend as source of truth.** No Prisma, no Supabase, no migrations in-repo. All CRUD goes through `https://api.insiightanalytics.com/api` with JWT Bearer auth.
- **JWT-embedded permissions.** Permissions travel in the token payload rather than being re-fetched per request. Cheap reads, stale on role change until re-login.
- **Client-side RBAC, server-side trust required.** UI gates via `usePermissions` / `PermissionGuard`; enforcement is the backend's job.
- **Styling split.** Tailwind for layout utilities; inline `style` objects using CSS custom properties for anything themeable. Keeps components dark-mode-ready even though dark mode isn't implemented.
- **SWR for client data.** Shared `fetcher` in `lib/swrFetchers.ts`; keys use `[url, token]` tuples so auth changes invalidate cache.
- **Credentials-only auth (effectively).** Google provider configured but disabled in callback — only email + password via bcrypt (12 rounds) against the backend.
- **Org boundary enforced at layout level, not middleware.** The `proxy.ts` matcher only checks "is there a session"; the `parent_org_id` match check lives in `app/(console)/[parent_org_id]/dashboard/layout.tsx`.
