-- Customer email (required field) and business-level editable health declaration text
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS health_declaration_text TEXT;
