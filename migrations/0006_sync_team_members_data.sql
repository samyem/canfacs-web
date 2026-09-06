-- CANFACS Migration 0006: Sync Team Leadership Profiles, Avatars, Professions, and Bios to Member Directory
-- Updates all BOD & Advisory members with photos from /team, professions, regions, salutations, bios, and specific organizational roles.

-- 1. Dr. Meghraj Gnawali (President)
UPDATE members SET
    salutation = 'Dr.',
    profession = 'Pediatrician',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/meghraj-gnawali.jpg',
    bio = 'Renowned medical doctor and pediatrician serving as President of CANFACS, advocating for child health initiatives, medical relief, cultural heritage, and community wellness nationwide.'
WHERE id = 'bod_meghraj_gnawali' OR email = 'gnawalim@gmail.com';

-- 2. Ms. Bina Shrestha (Vice President)
UPDATE members SET
    salutation = 'Ms.',
    profession = 'History / ECE Teacher',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/bina-shrestha.jpg',
    bio = 'Passionate educator with extensive background in history and early childhood education, preserving cultural heritage and empowering young learners.'
WHERE id = 'bod_bina_shrestha' OR email IN ('bina.shrestha@canfacs.org', 'shresthabina5@gmail.com');

-- 3. Mr. Prem Devkota (Vice President)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Engineer (BC Hydro)',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/prem-devkota.jpg',
    bio = 'Professional engineer at BC Hydro leading energy infrastructure initiatives and supporting bilateral technical & educational exchanges.'
WHERE id = 'bod_prem_devkota' OR email IN ('devkotapremb@gmail.com', 'devkotapremb@yahoo.com');

-- 4. Mr. Rudra Adhikari (Secretary-General)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Financial Analyst',
    province = 'NB',
    country = 'Canada',
    avatar_url = '/team/rudra-adhikari.jpg',
    bio = 'Senior financial analyst providing strategic corporate governance, organizational compliance, and financial stewardship across Atlantic Canada.'
WHERE id = 'bod_rudra_adhikari' OR email = 'adhikari.rudra@gmail.com';

-- 5. Mr. Samyem Tuladhar (Director of Communications & Admin)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Software Architect',
    province = 'ON',
    country = 'Canada',
    avatar_url = '/team/samyem-tuladhar.jpg',
    bio = 'Technology leader and software architect driving digital transformation, web platforms, and public outreach across Ontario and nationwide.'
WHERE id = 'bod_samyem_tuladhar' OR email = 'samyem@gmail.com';

-- 6. Mr. Kiroj Shrestha (Director)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Design Engineer (Toronto Transit)',
    province = 'ON',
    country = 'Canada',
    avatar_url = '/team/kiroj-shrestha.jpg',
    bio = 'Transportation design engineer with Toronto Transit, dedicated to civic infrastructure, youth engagement, and community building.'
WHERE id = 'bod_kiroj_shrestha' OR email = 'kirojks@hotmail.com';

-- 7. Mr. Debraj Dhakal (Treasurer)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Chartered Accountant',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/debraj-dhakal.jpg',
    bio = 'Certified accounting professional managing CANFACS financial planning, annual auditing, non-profit tax filings, and fiscal integrity.'
WHERE id = 'bod_debraj_dhakal' OR email = 'debrajdhakal1975@gmail.com';

-- 8. Mr. Purushottam Thapa (Director)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Financial Advisor',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/purushottam-thapa.jpg',
    bio = 'Financial advisory specialist helping families and newcomers navigate financial planning, investments, and community integration.'
WHERE id = 'bod_purushottam_thapa' OR email IN ('purushottam.thapa@canfacs.org', 'thapapu@gmail.com');

-- 9. Mr. Prakash Joshi (Director)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'Material Engineering Technologist',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/prakash-v-joshi.jpg',
    bio = 'Engineering technologist focusing on material testing, quality control, and strengthening professional networks for immigrant engineers.'
WHERE id = 'bod_prakash_joshi' OR email = 'prakash.joshi@canfacs.org';

-- 10. Mr. Navin Dhakal (Founding Secretary General & IB Chemistry Teacher)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'IB Chemistry Teacher',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/navin-dhakal.jpg',
    bio = 'Experienced educator bringing scientific rigor, academic leadership, and dedicated public service to CANFACS.'
WHERE id = 'bod_navin_dhakal' OR email IN ('navin.dhakal@canfacs.org', 'navin.dhakal@gmail.com');

-- 11. Mr. Mackenzie Ami Gospodin / Er. Mankajee Shrestha (Founder President)
UPDATE members SET
    salutation = 'Mr.',
    profession = 'P.Eng., M.Eng. ABA, SEMACP',
    province = 'BC',
    country = 'Canada',
    avatar_url = '/team/mackenzie-gospodin.jpg',
    bio = 'Founder President of CANFACS, dedicated community leader and engineer fostering bilateral Canada-Nepal educational and cultural bridges.'
WHERE id = 'bod_mackenzie_gospodin' OR email = 'mankajee@gmail.com';


-- Ensure specific organizational roles exist in organizational_roles table
INSERT OR IGNORE INTO organizational_roles (id, title, category, rank_order, description) VALUES
('org_director_comms', 'Director of Communications', 'executive', 45, 'Leads media relations, web platform, and public communications'),
('org_founder_president', 'Founder President', 'advisory', 5, 'Founding President of CANFACS Society');

-- Update Member Organizational Roles linking table with their specific executive titles
UPDATE member_organizational_roles
SET role_id = 'org_president'
WHERE member_id IN (SELECT id FROM members WHERE email = 'gnawalim@gmail.com');

UPDATE member_organizational_roles
SET role_id = 'org_vp'
WHERE member_id IN (SELECT id FROM members WHERE email IN ('bina.shrestha@canfacs.org', 'shresthabina5@gmail.com', 'devkotapremb@gmail.com', 'devkotapremb@yahoo.com'));

UPDATE member_organizational_roles
SET role_id = 'org_general_secretary'
WHERE member_id IN (SELECT id FROM members WHERE email IN ('adhikari.rudra@gmail.com', 'navin.dhakal@canfacs.org', 'navin.dhakal@gmail.com'));

UPDATE member_organizational_roles
SET role_id = 'org_treasurer'
WHERE member_id IN (SELECT id FROM members WHERE email = 'debrajdhakal1975@gmail.com');

UPDATE member_organizational_roles
SET role_id = 'org_director_comms'
WHERE member_id IN (SELECT id FROM members WHERE email = 'samyem@gmail.com');

UPDATE member_organizational_roles
SET role_id = 'org_founder_president'
WHERE member_id IN (SELECT id FROM members WHERE email = 'mankajee@gmail.com');
