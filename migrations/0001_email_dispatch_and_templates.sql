-- CANFACS Email Dispatcher, Audit Tracking & Template System
-- Migration 0001: email_batches, email_logs, email_templates

CREATE TABLE IF NOT EXISTS email_batches (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id TEXT,
    from_email TEXT NOT NULL,
    sender_admin_id TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    status TEXT NOT NULL, -- 'sent', 'failed'
    error_message TEXT,
    sent_at TEXT NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES email_batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_default TEXT,
    r2_key TEXT,
    html_content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
