@AGENTS.md

# yasmin-tor — מערכת תורים SaaS multi-tenant

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4
- Supabase (DB + Realtime + Auth)
- Framer Motion, Lucide icons, date-fns
- Deployed on Vercel: yasmin-tor.vercel.app

## Architecture
Multi-tenant platform. Each tenant (business) has its own:
- Supabase project (separate URL + anon key)
- Config in `tenants/<name>.ts` implementing `TenantConfig`
- Dynamic route: `app/[tenant]/` for booking, `app/[tenant]/admin/` for dashboard
- Super-admin at `app/super-admin/`

### Active Tenants
| Tenant | Slug | Category | Supabase |
|--------|------|----------|----------|
| Menta Nail | mentanail | nails | Configured |
| 180 Studio | 180studio | fitness | Placeholder |

### Env Vars Pattern
```
NEXT_PUBLIC_SUPABASE_URL_<TENANT_UPPER>
NEXT_PUBLIC_SUPABASE_ANON_KEY_<TENANT_UPPER>
```

## Key Directories
- `app/` — Next.js App Router pages
- `components/ui/` — Button, Modal, Input (shared)
- `components/booking/` — Customer-facing (TenantHomePage, BookingFlow, ServiceCard)
- `components/admin/` — Admin dashboard (AppointmentsView, ServicesManager, ScheduleManager, CustomersView, ProfileEditor)
- `components/super-admin/` — Cross-tenant dashboard
- `tenants/` — Tenant configs + types + registry
- `contexts/TenantContext.tsx` — Provides tenant config + supabase client
- `hooks/useSupabase.ts` — CRUD operations (services, appointments, schedule)
- `hooks/useRealtimeNotifications.ts` — Supabase Realtime for admin alerts
- `lib/notifications.ts` — Browser Notification API (tenant-scoped localStorage keys)
- `lib/supabase.ts` — Supabase client factory
- `lib/supabase-store.ts` — Data fetching functions

## Tenant Config Structure (`tenants/types.ts`)
Each tenant defines:
- `category`: 'nails' | 'fitness' | 'other' — controls gendered Hebrew labels
- `labels` — All UI strings (Hebrew), gender-aware per category
- `features` — Flags: autoApprove, groupSessions, showPrice, showDuration, etc.
- `defaultColors` — Brand colors (primary, secondary, background)
- `businessId` — Supabase business UUID

## Important Patterns

### Modal (components/ui/Modal.tsx)
Bottom sheet on mobile, centered on desktop. Key details:
- `footer` prop — renders OUTSIDE scroll area (shrink-0), always visible
- `pb-24 sm:pb-0` on panel — clears fixed nav bar on mobile
- `flex flex-col` panel with `flex-1 overflow-y-auto` for content
- `visualViewport` API lifts modal above iOS keyboard
- Expand gesture: swipe up → full screen, swipe down → collapse/close
- Use `form="<id>"` attribute on submit buttons in footer to connect to form inside scroll area

### Supabase Realtime
Always filter by `business_id` to prevent cross-tenant events:
```ts
filter: `business_id=eq.${businessId}`
```

### Notifications
Browser Notification API only (not push). localStorage keys are tenant-scoped:
```ts
`${tenantId}_notifications_enabled`
```

### Hebrew / RTL
- App is fully RTL Hebrew
- Labels are gender-aware per tenant category (feminine for nails, masculine for fitness)
- All new UI strings go in `tenants/types.ts` TenantLabels interface

### Mobile-First
- All UI is mobile-first. Test at 375px width
- Fixed bottom nav in admin (~72px + safe area)
- Use `active:scale-90` for press feedback on buttons
- Global press feedback: `button:not(:disabled):active { opacity: 0.65 }`

## Adding a New Tenant
1. Create `tenants/<name>.ts` implementing `TenantConfig`
2. Register in `tenants/index.ts`
3. Add env vars to Vercel: `NEXT_PUBLIC_SUPABASE_URL_<NAME>` + anon key
4. Set up Supabase project with matching schema
