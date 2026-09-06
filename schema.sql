-- CANFACS Database Schema for Cloudflare D1

CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    salutation TEXT, -- Dr., Mr., Ms., Prof.
    phone TEXT,
    phone_secondary TEXT,
    profession TEXT,
    organizational_role TEXT, -- e.g. Vice President, Cultural Advisor
    role_start_date TEXT,
    role_end_date TEXT,
    address_street TEXT,
    city TEXT,
    province TEXT,
    country TEXT DEFAULT 'Canada',
    postal_code TEXT,
    bio TEXT,
    facebook_id TEXT,
    instagram_id TEXT,
    associated_organizations TEXT,
    google_login_enabled INTEGER DEFAULT 1,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    role TEXT NOT NULL DEFAULT 'member', -- 'member', 'admin', 'bod', 'partner', etc.
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
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    status TEXT NOT NULL,
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

