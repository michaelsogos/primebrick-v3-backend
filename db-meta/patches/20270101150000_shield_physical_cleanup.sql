-- Client-shield physical cleanup (zero-debt sweep WP-1).
-- The shield machinery (registry / enrollment / rotating secrets) was
-- demolished in arch-internal-trust-and-transports: the A7 envelope and
-- HMAC edge signatures are the only proof. The registry table has no
-- readers left; the shield config entries are orphaned in every schema.
DROP TABLE IF EXISTS system.client_shield_registry;
DELETE FROM system.config_entries
 WHERE key LIKE 'service_client_shield%'
    OR key = 'service_key_derivation_secret';
