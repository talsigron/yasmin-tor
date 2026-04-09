-- Finance: payment options, expenses, monthly goals

-- Payment options enabled per business (which methods to show in UI)
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"bit":true,"paybox":false,"cash":true,"credit":false,"checks":false,"bank_transfer":false}'::jsonb;

-- Manual expenses log (optional feature)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS expenses_business_date_idx ON expenses(business_id, date DESC);

-- Categories are stored as TEXT. Default categories (editable per business) live in business_profiles.expense_categories
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS expense_categories JSONB DEFAULT '["שכירות","ציוד","חשבונות","שיווק","שכר","אחר"]'::jsonb;

-- Monthly goals (business_id, year, month, kind, value). kind: income|new_customers|sessions
CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  kind TEXT NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, year, month, kind)
);

-- Payment method tracking - extend transactions with a payment_method column if not exists
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Public insert expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete expenses" ON expenses FOR DELETE USING (true);

CREATE POLICY "Public read monthly_goals" ON monthly_goals FOR SELECT USING (true);
CREATE POLICY "Public insert monthly_goals" ON monthly_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update monthly_goals" ON monthly_goals FOR UPDATE USING (true);
CREATE POLICY "Public delete monthly_goals" ON monthly_goals FOR DELETE USING (true);
