-- Migration 0003: Add avatar_url to members table
ALTER TABLE members ADD COLUMN avatar_url TEXT;
