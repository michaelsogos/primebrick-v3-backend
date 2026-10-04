-- Fire-and-forget: per-protocol description lines for the
-- config.protocolSelect sheet panel (Part C4 — two-line rows).
-- Keys: system.settings.config.protocolSelect.desc.<proto> for the known
-- url-input protocols: http https ftp redis rediss tcp ws wss mailto.
-- Unknown/custom protocols render no description line (the FE falls back
-- to the raw key, which the panel detects and skips).
--
-- Languages: en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- Idempotent via ON CONFLICT.

BEGIN;

-- ─── protocolSelect.desc.http ──────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.http', 'en-GB', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'en-US', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'it-IT', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'fr-FR', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'es-ES', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'de-DE', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.http', 'pt-PT', 'HyperText Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.https ─────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.https', 'en-GB', 'Secure HTTP (TLS encrypted)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'en-US', 'Secure HTTP (TLS encrypted)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'it-IT', 'HTTP sicuro (crittografato TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'fr-FR', 'HTTP sécurisé (chiffré TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'es-ES', 'HTTP seguro (cifrado TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'de-DE', 'Sicheres HTTP (TLS-verschlüsselt)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.https', 'pt-PT', 'HTTP seguro (cifrado TLS)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.ftp ───────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.ftp', 'en-GB', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'en-US', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'it-IT', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'fr-FR', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'es-ES', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'de-DE', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ftp', 'pt-PT', 'File Transfer Protocol', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.redis ─────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.redis', 'en-GB', 'Redis server connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'en-US', 'Redis server connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'it-IT', 'Connessione server Redis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'fr-FR', 'Connexion au serveur Redis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'es-ES', 'Conexión al servidor Redis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'de-DE', 'Redis-Serververbindung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.redis', 'pt-PT', 'Ligação ao servidor Redis', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.rediss ────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.rediss', 'en-GB', 'Redis over TLS (secure)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'en-US', 'Redis over TLS (secure)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'it-IT', 'Redis su TLS (sicuro)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'fr-FR', 'Redis via TLS (sécurisé)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'es-ES', 'Redis sobre TLS (seguro)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'de-DE', 'Redis über TLS (sicher)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.rediss', 'pt-PT', 'Redis sobre TLS (seguro)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.tcp ───────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.tcp', 'en-GB', 'Raw TCP socket connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'en-US', 'Raw TCP socket connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'it-IT', 'Connessione socket TCP raw', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'fr-FR', 'Connexion socket TCP brute', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'es-ES', 'Conexión socket TCP sin formato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'de-DE', 'Reine TCP-Socket-Verbindung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.tcp', 'pt-PT', 'Ligação socket TCP pura', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.ws ────────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.ws', 'en-GB', 'WebSocket connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'en-US', 'WebSocket connection', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'it-IT', 'Connessione WebSocket', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'fr-FR', 'Connexion WebSocket', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'es-ES', 'Conexión WebSocket', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'de-DE', 'WebSocket-Verbindung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.ws', 'pt-PT', 'Ligação WebSocket', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.wss ───────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.wss', 'en-GB', 'Secure WebSocket (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'en-US', 'Secure WebSocket (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'it-IT', 'WebSocket sicuro (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'fr-FR', 'WebSocket sécurisé (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'es-ES', 'WebSocket seguro (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'de-DE', 'Sicheres WebSocket (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.wss', 'pt-PT', 'WebSocket seguro (TLS)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

-- ─── protocolSelect.desc.mailto ────────────────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.config.protocolSelect.desc.mailto', 'en-GB', 'Email address link', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'en-US', 'Email address link', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'it-IT', 'Collegamento a indirizzo email', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'fr-FR', 'Lien vers une adresse email', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'es-ES', 'Enlace a dirección de email', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'de-DE', 'Link zu E-Mail-Adresse', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.protocolSelect.desc.mailto', 'pt-PT', 'Ligação para endereço de email', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) DO NOTHING;

COMMIT;
