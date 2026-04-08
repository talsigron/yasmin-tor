-- ============================================================
-- יסמין תור — Migration 002
-- טבלת טנאנטים (עסקים פעילים במערכת)
-- להריץ ב-Supabase SQL Editor של פרויקט mentanail (המאסטר)
-- ============================================================

CREATE TABLE IF NOT EXISTS tenants (
  slug        TEXT PRIMARY KEY,              -- URL path: /studio-lana
  business_id UUID NOT NULL,                 -- FK to business_profiles.id
  category    TEXT NOT NULL DEFAULT 'other',  -- 'nails' | 'fitness' | 'other'
  owner_name  TEXT,
  owner_phone TEXT,
  colors      JSONB DEFAULT '{}',
  features    JSONB DEFAULT '{}',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- אינדקס לחיפוש לפי business_id
CREATE INDEX IF NOT EXISTS tenants_business_id_idx ON tenants (business_id);

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- כולם יכולים לקרוא (דף הזמנה ציבורי צריך את הconfig)
CREATE POLICY "allow_public_select" ON tenants
  FOR SELECT TO anon, authenticated
  USING (true);

-- רק authenticated יכולים להכניס ולעדכן (super-admin API)
CREATE POLICY "allow_authenticated_insert" ON tenants
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update" ON tenants
  FOR UPDATE TO authenticated
  USING (true);

-- ============================================================
-- הוספת הטנאנטים הקיימים (backward compatibility)
-- ============================================================

-- mentanail כבר קיים עם business_id מוכר
INSERT INTO tenants (slug, business_id, category, owner_name, owner_phone)
VALUES ('mentanail', 'f88f93c9-563b-42e1-9624-3a8817cab842', 'nails', 'מטר סיגרון', '0504558444')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- בדיקה
-- ============================================================
-- SELECT * FROM tenants;
