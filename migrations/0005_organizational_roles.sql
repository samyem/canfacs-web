-- CANFACS Migration 0005: Normalized Organizational Roles & Member Role Assignments
-- Creates organizational_roles reference table and member_organizational_roles linking table

CREATE TABLE IF NOT EXISTS organizational_roles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'board', -- 'executive', 'board', 'committee', 'advisory'
    rank_order INTEGER NOT NULL DEFAULT 100,
    description TEXT
);

CREATE TABLE IF NOT EXISTS member_organizational_roles (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES organizational_roles(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_member_org_roles_member ON member_organizational_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_org_roles_role ON member_organizational_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_member_org_roles_active ON member_organizational_roles(is_active);

-- Seed standard CANFACS Society Organizational Roles
INSERT OR IGNORE INTO organizational_roles (id, title, category, rank_order, description) VALUES
('org_president', 'President', 'executive', 10, 'Society President and Chief Executive Officer of the Board'),
('org_vp', 'Vice President', 'executive', 20, 'Executive Vice President assisting the President and leading key society programs'),
('org_general_secretary', 'General Secretary', 'executive', 30, 'Executive Secretary managing society correspondence, records, and minutes'),
('org_treasurer', 'Treasurer', 'executive', 40, 'Executive Treasurer overseeing financial governance, filings, and audit statements'),
('org_director', 'Board Director', 'board', 50, 'Sitting Member of the Board of Directors (BOD) participating in society governance'),
('org_cultural_director', 'Director of Cultural Affairs', 'committee', 60, 'Leads community cultural events, arts, and diaspora heritage programs'),
('org_community_outreach', 'Director of Community Outreach', 'committee', 70, 'Oversees inter-provincial outreach and member relations'),
('org_youth_coordinator', 'Youth & Sports Coordinator', 'committee', 80, 'Coordinates youth activities, student mentorship, and sports events'),
('org_senior_advisor', 'Senior Advisor', 'advisory', 90, 'Eminent community elder or advisor guiding society strategic vision');

-- Link current Board of Directors (BOD) members to their active organizational roles
INSERT OR IGNORE INTO member_organizational_roles (id, member_id, role_id, is_active, created_at)
SELECT 'mor_' || m.id, m.id, 'org_director', 1, '2026-09-06T10:00:00Z'
FROM members m
WHERE m.role IN ('bod', 'admin')
  AND m.id NOT IN (SELECT member_id FROM member_organizational_roles);
