-- CANFACS Migration 0004: Seed and Update Board of Directors (BOD) Members
-- Grouped from official TSV records with deduplication and collection of repeat emails.
-- Note: Organizational titles and tenure are normalized in organizational_roles and member_organizational_roles.

-- 1. Bina Shrestha (Primary: bina.shrestha@canfacs.org, Alt: shresthabina5@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, phone_secondary, created_at, approved_at
) VALUES (
    'bod_bina_shrestha', 'bina.shrestha@canfacs.org', 'Bina Shrestha', 'bod', 'approved', 1, 'shresthabina5@gmail.com', '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    phone_secondary = 'shresthabina5@gmail.com',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 2. Debraj Dhakal (Primary: debrajdhakal1975@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_debraj_dhakal', 'debrajdhakal1975@gmail.com', 'Debraj Dhakal', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 3. Kiroj Shrestha (Primary: kirojks@hotmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_kiroj_shrestha', 'kirojks@hotmail.com', 'Kiroj Shrestha', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 4. Mackenzie Ami Gospodin (Primary: mankajee@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_mackenzie_gospodin', 'mankajee@gmail.com', 'Mackenzie Ami Gospodin', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 5. Meghraj Gnawali (Primary: gnawalim@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_meghraj_gnawali', 'gnawalim@gmail.com', 'Meghraj Gnawali', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 6. Navin Dhakal (Primary: navin.dhakal@canfacs.org, Alt: navin.dhakal@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, phone_secondary, created_at, approved_at
) VALUES (
    'bod_navin_dhakal', 'navin.dhakal@canfacs.org', 'Navin Dhakal', 'bod', 'approved', 1, 'navin.dhakal@gmail.com', '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    phone_secondary = 'navin.dhakal@gmail.com',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 7. Prakash Joshi (Primary: prakash.joshi@canfacs.org)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_prakash_joshi', 'prakash.joshi@canfacs.org', 'Prakash Joshi', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 8. Prem Devkota (Primary: devkotapremb@gmail.com, Alt: devkotapremb@yahoo.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, phone_secondary, created_at, approved_at
) VALUES (
    'bod_prem_devkota', 'devkotapremb@gmail.com', 'Prem Devkota', 'bod', 'approved', 1, 'devkotapremb@yahoo.com', '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    phone_secondary = 'devkotapremb@yahoo.com',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 9. Purushottam Thapa (Primary: purushottam.thapa@canfacs.org, Alt: thapapu@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, phone_secondary, created_at, approved_at
) VALUES (
    'bod_purushottam_thapa', 'purushottam.thapa@canfacs.org', 'Purushottam Thapa', 'bod', 'approved', 1, 'thapapu@gmail.com', '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    phone_secondary = 'thapapu@gmail.com',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 10. Rudra Adhikari (Primary: adhikari.rudra@gmail.com)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_rudra_adhikari', 'adhikari.rudra@gmail.com', 'Rudra Adhikari', 'bod', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'bod',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);

-- 11. Samyem Tuladhar (Primary: samyem@gmail.com - Admin & BOD Member)
INSERT INTO members (
    id, email, full_name, role, status, google_login_enabled, created_at, approved_at
) VALUES (
    'bod_samyem_tuladhar', 'samyem@gmail.com', 'Samyem Tuladhar', 'admin', 'approved', 1, '2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'
) ON CONFLICT(email) DO UPDATE SET
    full_name = excluded.full_name,
    role = 'admin',
    status = 'approved',
    approved_at = COALESCE(members.approved_at, excluded.approved_at);
