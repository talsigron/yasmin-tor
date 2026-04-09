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

## Feature Overview (as of 2026-04-10)

### Multi-tenant dashboard — 5 tabs:
1. **אימונים** — יומן + לו"ז (sub-tabs)
2. **לקוחות** — grid of 8 colored category squares (all, pending, new-month, active-month, inactive, missing-fields, top, registered) + customer detail modal with punch cards management
3. **כרטיסיות** — stats (פעילות/לפני סיום/חובות) + tabs: cards / near_end / debts / types
4. **כספים** — overview / income / expenses / debts / goals + month/year picker + payment breakdown + top spenders + monthly comparison + projected income
5. **עריכה** (ProfileEditor) — all settings: business info, cover image, logo, colors, booking settings, popup banner, notifications, services, shop, gallery, payment options, password

### Dashboard > Edit (ProfileEditor) sections:
- Basic info (name, subtitle, description, phone, instagram, address)
- Logo + cover image
- Brand colors
- Booking settings (max days, min hours, cancel policy, cancellation hours limit, show participants, health declaration requirement)
- Popup banner message (enabled, text, end date + time, dismissible)
- Notifications (owner email, owner notify channels/events, customer notify channels/events)
- Services (ServicesManager embedded)
- Shop (ShopManager embedded)
- Gallery images
- Payment options (Bit/PayBox + cash/credit/checks/bank_transfer toggles)
- Password

### Customer facing (booking page) order:
1. Cover/header
2. BannerMessage (if enabled)
3. Gallery (if images)
4. Services (wide card if single, grid if multiple)
5. ShopSection (if enabled)
6. Footer

### Punch card measurement types:
- `entries` — fixed entries count
- `months` — time-based (monthsCount, auto-computes expiresAt)
- `unlimited` — no entry limit, optional validityDays
- Each type has `nearEndDays` threshold for "לפני סיום" badge

### Customer registration form (required fields):
- שם מלא
- טלפון (validated: `^0\d{8,9}$`)
- מייל (validated)
- תאריך לידה
- מדיניות פרטיות
- Fitness extras: ת.ז, מין, אמצעי תשלום, הצהרת בריאות (if enabled)
- Optional: סוג כרטיסייה (dropdown if card types exist)
- Draft persistence via `register_draft_<tenantId>` in localStorage

### Health declaration text (hardcoded, generic, same for all fitness tenants):
Header includes business name, then 6 numbered points (fitness, disclaimers, risk acknowledgement, waiver).
Located in `components/booking/RegisterForm.tsx` in the fitness section.

### Email infrastructure (Resend)
- `app/api/send-email/route.ts` — server endpoint
- `lib/email.ts` — client helper + templates (customerRegistered, customerBooked, customerCancelled, birthday, bookingConfirmation, cancelConfirmation)
- Env vars: `RESEND_API_KEY` (required), `EMAIL_FROM` (optional, defaults to `onboarding@resend.dev`)
- Templates use rtl HTML with business brand color
- Triggered from RegisterForm, BookingFlow, TenantHomePage — all gated on profile.ownerNotify settings
- Owner email is stored in `business_profiles.owner_email`
- Notification preferences stored as JSONB in `owner_notify` and `customer_notify`
- **Domain note:** Without verified domain, `onboarding@resend.dev` can only send to the Resend account's own email. Verify a domain to send to customers.

### Super-admin bypass
AdminPageContent checks `localStorage.getItem('yasmin_super_admin_session') === 'true'` — if yes, skip password entirely. Allows super-admin to enter any tenant's dashboard without knowing their password.

## Key DB tables (Supabase)
- `business_profiles` — business settings (lots of columns; see migrations 001-011)
- `services`, `appointments`, `availability`, `default_hours`
- `customers` — with email, extended fitness fields, selected_punch_card_type_id
- `punch_card_types` — with measurement_type, months_count, near_end_days
- `customer_punch_cards` — with measurement_type
- `shop_items`
- `transactions` — payments log with payment_method
- `expenses` — optional manual expense log
- `monthly_goals` — per-month target per business
- `gallery_images`

## Migrations reference (`migrations/*.sql`)
- 003: punch cards, shop, transactions base
- 004: shop image_url + amount_paid
- 005: banner message columns
- 006: finance (payment_methods JSONB, expenses, monthly_goals, expense_categories)
- 007: banner end_time column
- 008: punch_card measurement_type + months_count + near_end_days + customers.selected_punch_card_type_id
- 009: show_participants boolean
- 010: owner_email + owner_notify + customer_notify JSONB
- 011: customers.email + business_profiles.health_declaration_text (column unused in UI, generic text hardcoded in RegisterForm)

## Session Log (running list of major changes)

### 2026-04-10 Big session (covered all the items from fitness trainer meeting + extras):
- Fixed ICS calendar event business name bug (was hardcoded `Menta Nail`)
- Single service wide display when only 1 service exists
- Popup banner message on home page (configurable text + end date/time + dismissible per-session)
- 5-tab dashboard restructure (appointments/customers/punch-cards/finance/profile)
- Schedule moved to sub-tab inside appointments
- Services, shop, gallery all moved into ProfileEditor sections
- Finance tab with full feature set
- Payment options UI (6 methods toggleable)
- Customers redesign: 8 clickable category squares always visible
- Customer detail modal with editable personal info + punch card management
- Booking date display improved (day name, DD/MM, larger time ranges)
- Punch cards: added measurement types + near-end badge + near_end tab
- Registration form: punch card type dropdown + email required + all fields required + form persistence via localStorage + health declaration checkbox with standard generic text
- Participants list toggle in booking flow
- Schedule manager wording fixed (masculine + clearer scope explanation)
- Email infrastructure via Resend
- Notification settings system
- Owner cancellation email alerts
- Super-admin bypass for all business dashboards
- Finance month/year picker
- Projected income widget (from paid cards with expiry)

## IMPORTANT rules when editing this codebase
- Always respect the "universal" principle — do NOT hardcode features specific to one business. Add a profile toggle or config field.
- Hebrew is masculine (זכר) for fitness, feminine for nails. Don't accidentally mix.
- All new DB columns need `IF NOT EXISTS` migrations + updates to `fetchProfile` + `updateProfileData` + types
- When adding a new column: update migration file, lib/types.ts, supabase-store.ts fetch/update, and UI
- Don't remove the `showParticipants` / `requireHealthDeclaration` / other optional toggles — they make the system universal
