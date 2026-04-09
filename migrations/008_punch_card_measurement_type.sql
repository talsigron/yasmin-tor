-- Punch card measurement types: entries (count-based) | months (time-based) | unlimited
ALTER TABLE punch_card_types
  ADD COLUMN IF NOT EXISTS measurement_type TEXT NOT NULL DEFAULT 'entries',
  ADD COLUMN IF NOT EXISTS months_count INT,
  ADD COLUMN IF NOT EXISTS near_end_days INT DEFAULT 3;

ALTER TABLE customer_punch_cards
  ADD COLUMN IF NOT EXISTS measurement_type TEXT NOT NULL DEFAULT 'entries';

-- Show selected punch cards in customer registration form
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS selected_punch_card_type_id UUID;
