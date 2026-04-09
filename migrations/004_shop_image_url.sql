-- Add image_url column to shop_items
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add amount_paid column to customer_punch_cards (for future use; partial payment tracking uses transactions table)
ALTER TABLE customer_punch_cards ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
