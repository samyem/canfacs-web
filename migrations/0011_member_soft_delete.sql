-- Migration 0011: Member Soft Delete and Lifecycle Audit
-- Adds deleted_at column to support soft-deletion and undo restore

ALTER TABLE members ADD COLUMN deleted_at TEXT;
