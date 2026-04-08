-- ============================================================
-- יסמין תור — Migration 001
-- טבלת פניות הרשמה של עסקים חדשים
-- להריץ ב-Supabase SQL Editor של פרויקט mentanail (המאסטר)
-- ============================================================

CREATE TABLE IF NOT EXISTS business_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name    TEXT NOT NULL,
  phone         TEXT NOT NULL,
  category      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- אינדקס לחיפוש מהיר לפי סטטוס
CREATE INDEX IF NOT EXISTS business_registrations_status_idx
  ON business_registrations (status);

-- RLS: הפעל
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;

-- כל אחד יכול להכניס רשומה (טופס הרשמה ציבורי)
CREATE POLICY "allow_public_insert" ON business_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- רק authenticated יכולים לקרוא (super-admin)
CREATE POLICY "allow_authenticated_select" ON business_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- רק authenticated יכולים לעדכן (לשנות סטטוס)
CREATE POLICY "allow_authenticated_update" ON business_registrations
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- בדיקה
-- ============================================================
-- SELECT * FROM business_registrations ORDER BY created_at DESC;
