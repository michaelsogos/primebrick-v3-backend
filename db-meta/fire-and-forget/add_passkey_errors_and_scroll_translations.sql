-- Fire-and-forget patch: passkey error specificity + scroll-to-bottom pill.
--
-- 1) app.auth.login.passkey.credentialNotFound — the browser holds a passkey
--    whose credential is no longer registered in the IDP (internal_code
--    webauthn_credential_not_found). Specific actionable message instead of
--    the generic login error.
-- 2) app.auth.login.passkey.sessionExpired — the WebAuthn ceremony session
--    (Redis relay nonce) expired before finish.
-- 3) app.common.scrollToBottom — aria-label of the back-to-bottom pill in
--    the AI chat panel.
--
-- en-US mirrors en-GB (the en-US dictionaries were seeded from en-GB).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

WITH localized(ns, key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.auth.login.passkey', 'credentialNotFound',
      'No passkey registered for this account. Re-register your passkey or sign in with password.',
      'Nessuna passkey registrata per questo account. Registra di nuovo la passkey o accedi con password.',
      'Aucune passkey enregistrée pour ce compte. Réenregistrez votre passkey ou connectez-vous avec un mot de passe.',
      'No hay ninguna passkey registrada para esta cuenta. Vuelve a registrar tu passkey o inicia sesión con contraseña.',
      'Kein Passkey für dieses Konto registriert. Registrieren Sie den Passkey erneut oder melden Sie sich mit einem Passwort an.',
      'Nenhuma passkey registada para esta conta. Volte a registar a passkey ou inicie sessão com palavra-passe.'),
    ('app.auth.login.passkey', 'sessionExpired',
      'The sign-in ceremony expired. Please try again.',
      'La procedura di accesso è scaduta. Riprova.',
      'La cérémonie de connexion a expiré. Veuillez réessayer.',
      'La ceremonia de inicio de sesión ha caducado. Inténtalo de nuevo.',
      'Die Anmeldezeremonie ist abgelaufen. Bitte versuchen Sie es erneut.',
      'A cerimónia de início de sessão expirou. Tente novamente.'),
    ('app.common', 'scrollToBottom',
      'Scroll to latest messages',
      'Scorri agli ultimi messaggi',
      'Aller aux derniers messages',
      'Ir a los últimos mensajes',
      'Zu den neuesten Nachrichten scrollen',
      'Ir para as mensagens mais recentes')
), expanded AS (
  SELECT ns || '.' || key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('en-US', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

COMMIT;
