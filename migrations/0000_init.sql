-- CANFACS Database Schema for Cloudflare D1
-- Migration 0000: Initial Schema

CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    profession TEXT,
    city TEXT,
    province TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    role TEXT NOT NULL DEFAULT 'member', -- 'member', 'admin'
    created_at TEXT NOT NULL,
    approved_at TEXT
);

CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    original_post_id TEXT, -- set if this is a reshare/repost
    created_at TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (post_id, member_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reshares (
    id TEXT PRIMARY KEY,
    original_post_id TEXT NOT NULL,
    reshared_by_id TEXT NOT NULL,
    commentary TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reshared_by_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    target_goal REAL NOT NULL DEFAULT 10000,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL DEFAULT 'nepal-flood-2024',
    donor_name TEXT NOT NULL,
    email TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CAD',
    message TEXT,
    status TEXT NOT NULL DEFAULT 'received', -- 'pledged', 'received'
    is_anonymous INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS disbursements (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL DEFAULT 'nepal-flood-2024',
    recipient TEXT NOT NULL,
    amount REAL NOT NULL,
    disbursed_at TEXT NOT NULL,
    reference_number TEXT,
    notes TEXT,
    document_url TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS disbursement_allocations (
    id TEXT PRIMARY KEY,
    disbursement_id TEXT NOT NULL,
    donation_id TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (disbursement_id) REFERENCES disbursements(id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);
