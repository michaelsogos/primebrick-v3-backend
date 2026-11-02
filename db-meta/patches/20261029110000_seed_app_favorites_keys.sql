-- app.favorites.* — page-header star toggle + launcher favorites pseudo-root
-- labels. Same seed pattern as app.nav.*: one row per shipped language,
-- insert-once.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.favorites.title', 'en-GB', 'Favourites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'en-US', 'Favorites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'it-IT', 'Preferiti', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'fr-FR', 'Favoris', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'es-ES', 'Favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'pt-PT', 'Favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.title', 'de-DE', 'Favoriten', now(), 'migration-favorites', now(), 'migration-favorites', 1),

  ('app.favorites.add', 'en-GB', 'Add to favourites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'en-US', 'Add to favorites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'it-IT', 'Aggiungi ai preferiti', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'fr-FR', 'Ajouter aux favoris', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'es-ES', 'Añadir a favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'pt-PT', 'Adicionar aos favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.add', 'de-DE', 'Zu Favoriten hinzufügen', now(), 'migration-favorites', now(), 'migration-favorites', 1),

  ('app.favorites.remove', 'en-GB', 'Remove from favourites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'en-US', 'Remove from favorites', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'it-IT', 'Rimuovi dai preferiti', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'fr-FR', 'Retirer des favoris', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'es-ES', 'Quitar de favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'pt-PT', 'Remover dos favoritos', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.remove', 'de-DE', 'Aus Favoriten entfernen', now(), 'migration-favorites', now(), 'migration-favorites', 1),

  ('app.favorites.empty', 'en-GB', 'No favourites yet — star a page to pin it here', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'en-US', 'No favorites yet — star a page to pin it here', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'it-IT', 'Nessun preferito — aggiungi una pagina con la stella', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'fr-FR', 'Aucun favori — épinglez une page avec l''étoile', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'es-ES', 'Sin favoritos — marca una página con la estrella', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'pt-PT', 'Sem favoritos — marque uma página com a estrela', now(), 'migration-favorites', now(), 'migration-favorites', 1),
  ('app.favorites.empty', 'de-DE', 'Keine Favoriten — markieren Sie eine Seite mit dem Stern', now(), 'migration-favorites', now(), 'migration-favorites', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
