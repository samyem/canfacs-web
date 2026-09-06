-- CANFACS Migration 0008: Add parent_role_id to organizational_roles and seed Admin role under BOD
-- Allows defining hierarchical roles where a role (e.g. Admin) can be a child/subset of another (e.g. BOD)

ALTER TABLE organizational_roles ADD COLUMN parent_role_id TEXT REFERENCES organizational_roles(id);

CREATE INDEX IF NOT EXISTS idx_org_roles_parent ON organizational_roles(parent_role_id);

-- Insert Administrator as an organizational role with parent_role_id pointing to Board Director (org_director)
INSERT OR IGNORE INTO organizational_roles (id, title, category, rank_order, description, parent_role_id) VALUES
('org_admin', 'Administrator', 'executive', 5, 'System Administrator & Governance Lead with administrative privileges (subset of Board of Directors)', 'org_director');

-- Update any existing executive roles if desired
UPDATE organizational_roles SET parent_role_id = 'org_director' WHERE id IN ('org_president', 'org_vp', 'org_general_secretary', 'org_treasurer', 'org_admin') AND (parent_role_id IS NULL OR parent_role_id = '');
