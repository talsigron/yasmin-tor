-- Allow business to optionally show participants of a session to new customers
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS show_participants BOOLEAN DEFAULT FALSE;
