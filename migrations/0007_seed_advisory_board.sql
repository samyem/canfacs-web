-- CANFACS Migration 0007: Seed Advisory Board Members & Add Advisory Roles
-- Inserts advisory members into members and links them to organizational_roles under category 'advisory'

-- 1. Ensure advisory organizational roles exist
INSERT OR IGNORE INTO organizational_roles (id, title, category, rank_order, description) VALUES
('org_founder_vp', 'Founder Vice President', 'advisory', 6, 'Founding Vice President of CANFACS Society'),
('org_past_president', 'Past President', 'advisory', 7, 'Past President of CANFACS Society'),
('org_advisory_board', 'Advisory Board Member', 'advisory', 95, 'Eminent member of the CANFACS Advisory Board'),
('org_consul_general', 'Honorable Consul General', 'advisory', 92, 'Honorable Consul General of Nepal and Society Advisor');

-- 2. Dr. Drona Prakash Rasali (Founder Vice President)
INSERT INTO members (
    id, email, full_name, salutation, profession, avatar_url, role, status, google_login_enabled, bio, created_at, approved_at
) VALUES (
    'adv_drona_rasali', 'drona.rasali@canfacs.org', 'Dr. Drona Prakash Rasali', 'Dr.', 'BVSc, PGT, MS, PhD, FACE, DSFV',
    '/team/drona-rasali.jpg', 'advisory', 'approved', 1,
    'Founder Vice President of CANFACS, distinguished epidemiological scientist, and community health leader.',
    '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    salutation = excluded.salutation,
    profession = excluded.profession,
    avatar_url = excluded.avatar_url,
    role = 'advisory',
    status = 'approved',
    bio = excluded.bio;

-- 3. Claude A. Charette (Past President)
INSERT INTO members (
    id, email, full_name, profession, avatar_url, role, status, google_login_enabled, bio, created_at, approved_at
) VALUES (
    'adv_claude_charette', 'claude.charette@canfacs.org', 'Claude A. Charette', 'Fonctionnaire chez Govt.',
    '/team/claude-charette.jpg', 'advisory', 'approved', 1,
    'Past President of CANFACS, long-time public servant fostering bilateral Canadian-Nepali cooperation.',
    '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    profession = excluded.profession,
    avatar_url = excluded.avatar_url,
    role = 'advisory',
    status = 'approved',
    bio = excluded.bio;

-- 4. Hon. Randeep Sarai (Member of Parliament)
INSERT INTO members (
    id, email, full_name, salutation, profession, city, province, country, avatar_url, role, status, google_login_enabled, bio, created_at, approved_at
) VALUES (
    'adv_randeep_sarai', 'randeep.sarai@canfacs.org', 'Hon. Randeep Sarai', 'Hon.', 'Member of Parliament (MP)',
    'Surrey', 'BC', 'Canada', '/team/randeep-sarai.jpg', 'advisory', 'approved', 1,
    'Member of Parliament for Surrey Centre and Advisory Board Member of CANFACS, championing multicultural community engagement.',
    '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    salutation = excluded.salutation,
    profession = excluded.profession,
    city = excluded.city,
    province = excluded.province,
    avatar_url = excluded.avatar_url,
    role = 'advisory',
    status = 'approved',
    bio = excluded.bio;

-- 5. Hon. Chris Considine (Honorable Consul General)
INSERT INTO members (
    id, email, full_name, salutation, profession, avatar_url, role, status, google_login_enabled, bio, created_at, approved_at
) VALUES (
    'adv_chris_considine', 'chris.considine@canfacs.org', 'Hon. Chris Considine', 'Hon.', '(K.C.) Lawyer & Consul General',
    '/team/chris-considine.jpg', 'advisory', 'approved', 1,
    'Honorable Consul General of Nepal and senior legal counsel (K.C.), advising CANFACS on bilateral and diplomatic affairs.',
    '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    salutation = excluded.salutation,
    profession = excluded.profession,
    avatar_url = excluded.avatar_url,
    role = 'advisory',
    status = 'approved',
    bio = excluded.bio;

-- 6. Dr. William Osei (Advisory Board Member)
INSERT INTO members (
    id, email, full_name, salutation, profession, avatar_url, role, status, google_login_enabled, bio, created_at, approved_at
) VALUES (
    'adv_william_osei', 'william.osei@canfacs.org', 'Dr. William Osei', 'Dr.', 'MD, MPH FACE (Osei Global Health)',
    '/team/william-osei.jpg', 'advisory', 'approved', 1,
    'Global health leader, public health specialist, and Advisory Board Member advising on international medical initiatives.',
    '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    salutation = excluded.salutation,
    profession = excluded.profession,
    avatar_url = excluded.avatar_url,
    role = 'advisory',
    status = 'approved',
    bio = excluded.bio;

-- 7. Link to member_organizational_roles
INSERT OR REPLACE INTO member_organizational_roles (id, member_id, role_id, is_active, created_at) VALUES
('mor_adv_drona_rasali', 'adv_drona_rasali', 'org_founder_vp', 1, '2026-09-06T10:00:00Z'),
('mor_adv_claude_charette', 'adv_claude_charette', 'org_past_president', 1, '2026-09-06T10:00:00Z'),
('mor_adv_randeep_sarai', 'adv_randeep_sarai', 'org_advisory_board', 1, '2026-09-06T10:00:00Z'),
('mor_adv_chris_considine', 'adv_chris_considine', 'org_consul_general', 1, '2026-09-06T10:00:00Z'),
('mor_adv_william_osei', 'adv_william_osei', 'org_advisory_board', 1, '2026-09-06T10:00:00Z');
