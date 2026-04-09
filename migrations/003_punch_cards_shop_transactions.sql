-- כרטיסיות סוגים
CREATE TABLE IF NOT EXISTS punch_card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  entries_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- כרטיסיות לקוחות
CREATE TABLE IF NOT EXISTS customer_punch_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT,
  punch_card_type_id UUID REFERENCES punch_card_types(id),
  punch_card_name TEXT NOT NULL,
  entries_total INTEGER NOT NULL,
  entries_used INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_paid BOOLEAN DEFAULT false,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- חנות מוצרים
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- עסקאות / תשלומים
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- הוסף עמודות ל-business_profiles
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS cancellation_hours_limit INTEGER DEFAULT 6;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS shop_enabled BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE punch_card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_punch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access punch_card_types" ON punch_card_types FOR ALL USING (true);
CREATE POLICY "Public access customer_punch_cards" ON customer_punch_cards FOR ALL USING (true);
CREATE POLICY "Public access shop_items" ON shop_items FOR ALL USING (true);
CREATE POLICY "Public access transactions" ON transactions FOR ALL USING (true);
