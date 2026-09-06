-- CANFACS Member Extended Attributes Migration
-- Migration 0002: Add salutation, organizational_role, role_start_date, role_end_date, address fields, phone_secondary, facebook_id, instagram_id, associated_organizations, google_login_enabled

ALTER TABLE members ADD COLUMN salutation TEXT; -- e.g. Dr., Mr., Ms., Prof.
ALTER TABLE members ADD COLUMN organizational_role TEXT; -- e.g. Vice President, Director of Culture, Senior Advisor
ALTER TABLE members ADD COLUMN role_start_date TEXT; -- YYYY-MM-DD
ALTER TABLE members ADD COLUMN role_end_date TEXT; -- YYYY-MM-DD
ALTER TABLE members ADD COLUMN address_street TEXT;
ALTER TABLE members ADD COLUMN country TEXT DEFAULT 'Canada';
ALTER TABLE members ADD COLUMN postal_code TEXT;
ALTER TABLE members ADD COLUMN phone_secondary TEXT;
ALTER TABLE members ADD COLUMN facebook_id TEXT;
ALTER TABLE members ADD COLUMN instagram_id TEXT;
ALTER TABLE members ADD COLUMN associated_organizations TEXT; -- e.g. NRN Canada, Embassy of Nepal, UBC Nepal Club
ALTER TABLE members ADD COLUMN google_login_enabled INTEGER DEFAULT 1;
