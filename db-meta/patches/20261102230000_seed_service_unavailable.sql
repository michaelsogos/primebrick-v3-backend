-- `app.service.unavailable` + `app.service.unavailable_detail` — the dedicated
-- page state shown when the owning microservice is not online (SSE registry
-- gate): {service} is the service code; the view auto-recovers on register.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.service.unavailable', 'en-GB', 'Service {service} is unavailable', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'en-US', 'Service {service} is unavailable', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'it-IT', 'Il servizio {service} non è disponibile', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'de-DE', 'Der Dienst {service} ist nicht verfügbar', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'fr-FR', 'Le service {service} n''est pas disponible', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'es-ES', 'El servicio {service} no está disponible', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable', 'pt-PT', 'O serviço {service} não está disponível', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'en-GB', 'The microservice owning this page is offline, restarting or degraded. The page reloads automatically as soon as it comes back online — no action needed.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'en-US', 'The microservice owning this page is offline, restarting or degraded. The page reloads automatically as soon as it comes back online — no action needed.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'it-IT', 'Il microservizio proprietario di questa pagina è offline, in riavvio o degradato. La pagina si ricarica automaticamente appena torna online — nessuna azione richiesta.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'de-DE', 'Der Microservice, dem diese Seite gehört, ist offline, startet neu oder ist eingeschränkt. Die Seite lädt automatisch neu, sobald er wieder online ist — keine Aktion erforderlich.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'fr-FR', 'Le microservice propriétaire de cette page est hors ligne, en redémarrage ou dégradé. La page se recharge automatiquement dès qu''il est de nouveau en ligne — aucune action requise.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'es-ES', 'El microservicio propietario de esta página está fuera de línea, reiniciándose o degradado. La página se recarga automáticamente en cuanto vuelva a estar en línea — no hace falta hacer nada.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1),
  ('app.service.unavailable_detail', 'pt-PT', 'O microserviço proprietário desta página está offline, a reiniciar ou degradado. A página recarrega automaticamente assim que ficar online — nenhuma ação necessária.', now(), 'migration-service-unavailable', now(), 'migration-service-unavailable', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
