-- CANFACS Migration 0009: Add content_html to email_batches
-- Stores the original HTML message content dispatched in each batch for audit review and re-use

ALTER TABLE email_batches ADD COLUMN content_html TEXT;
