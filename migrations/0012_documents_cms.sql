-- CANFACS Public Documents CMS & Attachments
-- Migration 0012: documents table

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    content_html TEXT NOT NULL,
    banner_image_url TEXT,
    attachments TEXT, -- JSON array of { id, key, fileName, fileSize, sizeBytes, url, contentType }
    status TEXT NOT NULL DEFAULT 'published', -- 'published', 'draft'
    author_id TEXT,
    author_name TEXT,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
