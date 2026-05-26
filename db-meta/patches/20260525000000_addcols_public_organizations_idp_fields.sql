-- Add idp_owner and idp_name columns to organizations table
-- These fields store the Casdoor organization owner and name separately
-- for better alignment with user_profile structure and Casdoor API calls

ALTER TABLE organizations ADD COLUMN idp_owner VARCHAR(255);
ALTER TABLE organizations ADD COLUMN idp_name VARCHAR(255);
