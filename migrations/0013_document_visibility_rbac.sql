-- CANFACS Document Role-Based Access Control (RBAC) & Visibility
-- Migration 0013: Add visibility column to documents table

ALTER TABLE documents ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
