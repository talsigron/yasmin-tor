-- Add optional end time for popup banner (combined with banner_end_date)
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS banner_end_time TIME;
