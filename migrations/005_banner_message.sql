-- Popup message banner on home page
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banner_message TEXT,
  ADD COLUMN IF NOT EXISTS banner_end_date DATE,
  ADD COLUMN IF NOT EXISTS banner_dismissible BOOLEAN DEFAULT TRUE;
