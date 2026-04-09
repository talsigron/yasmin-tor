-- Notification preferences per business
-- Owner wants to be notified about:
--   new_customer, customer_booked, customer_cancelled, monthly_summary
-- Customer updates:
--   booking_confirmed, cancel_confirmed, birthday_greeting
-- Channel: email (sms coming later)
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS owner_notify JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "events": {
      "new_customer": true,
      "customer_booked": true,
      "customer_cancelled": true,
      "monthly_summary": false
    }
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_notify JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "events": {
      "booking_confirmed": true,
      "cancel_confirmed": true,
      "birthday_greeting": true
    }
  }'::jsonb;
