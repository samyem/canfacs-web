-- CANFACS Migration 0010: Add display_order to members for custom presentation ordering
ALTER TABLE members ADD COLUMN display_order INTEGER DEFAULT 100;
