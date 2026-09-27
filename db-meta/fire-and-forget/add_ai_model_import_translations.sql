-- add_ai_model_import_translations.sql
-- Keys for the "Add model" right sheet (HF ONNX search) and the
-- cerebellum assistant selector default-option label.
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.ai.cerebellum.model_default', 'en-GB', 'Default Cerebellum', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'en-US', 'Default Cerebellum', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'it-IT', 'Cervelletto predefinito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'fr-FR', 'Cervelet par défaut', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'es-ES', 'Cerebello predeterminado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'de-DE', 'Standard-Kleinhirn', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.ai.cerebellum.model_default', 'pt-PT', 'Cerebelo predefinido', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.add_model', 'en-GB', 'Add model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'en-US', 'Add model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'it-IT', 'Aggiungi modello', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'fr-FR', 'Ajouter un modèle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'es-ES', 'Añadir modelo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'de-DE', 'Modell hinzufügen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model', 'pt-PT', 'Adicionar modelo', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.add_model_hint', 'en-GB', 'Search Hugging Face for ONNX text-generation models (≤5B parameters) and add one to the catalog.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'en-US', 'Search Hugging Face for ONNX text-generation models (≤5B parameters) and add one to the catalog.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'it-IT', 'Cerca su Hugging Face modelli ONNX di text-generation (≤5B parametri) e aggiungine uno al catalogo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'fr-FR', 'Recherchez sur Hugging Face des modèles ONNX de text-generation (≤5B paramètres) et ajoutez-en un au catalogue.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'es-ES', 'Busca en Hugging Face modelos ONNX de text-generation (≤5B parámetros) y añade uno al catálogo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'de-DE', 'Suche auf Hugging Face nach ONNX-Text-Generation-Modellen (≤5B Parameter) und füge eines zum Katalog hinzu.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_model_hint', 'pt-PT', 'Pesquise no Hugging Face modelos ONNX de text-generation (≤5B parâmetros) e adicione um ao catálogo.', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.search_hf', 'en-GB', 'Search ONNX models on Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'en-US', 'Search ONNX models on Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'it-IT', 'Cerca modelli ONNX su Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'fr-FR', 'Rechercher des modèles ONNX sur Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'es-ES', 'Buscar modelos ONNX en Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'de-DE', 'ONNX-Modelle auf Hugging Face suchen…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.search_hf', 'pt-PT', 'Pesquisar modelos ONNX no Hugging Face…', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.added', 'en-GB', 'added to the catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'en-US', 'added to the catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'it-IT', 'aggiunto al catalogo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'fr-FR', 'ajouté au catalogue', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'es-ES', 'añadido al catálogo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'de-DE', 'zum Katalog hinzugefügt', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.added', 'pt-PT', 'adicionado ao catálogo', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.add_failed', 'en-GB', 'Failed to add the model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'en-US', 'Failed to add the model', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'it-IT', 'Aggiunta del modello non riuscita', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'fr-FR', 'Échec de l''ajout du modèle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'es-ES', 'Error al añadir el modelo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'de-DE', 'Modell konnte nicht hinzugefügt werden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.add_failed', 'pt-PT', 'Falha ao adicionar o modelo', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.fields.dtype', 'en-GB', 'Quantization', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'en-US', 'Quantization', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'it-IT', 'Quantizzazione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'fr-FR', 'Quantification', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'es-ES', 'Cuantización', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'de-DE', 'Quantisierung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.fields.dtype', 'pt-PT', 'Quantização', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.view_on_hf', 'en-GB', 'Open the model page on Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'en-US', 'Open the model page on Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'it-IT', 'Vai alla pagina del modello su Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'fr-FR', 'Ouvrir la page du modèle sur Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'es-ES', 'Abrir la página del modelo en Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'de-DE', 'Modellseite auf Hugging Face öffnen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.view_on_hf', 'pt-PT', 'Abrir a página do modelo no Hugging Face', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.sort_downloads', 'en-GB', 'Most downloaded', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'en-US', 'Most downloaded', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'it-IT', 'Più scaricati', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'fr-FR', 'Plus téléchargés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'es-ES', 'Más descargados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'de-DE', 'Meistgeladen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_downloads', 'pt-PT', 'Mais descarregados', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.sort_trending', 'en-GB', 'Trending', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'en-US', 'Trending', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'it-IT', 'Di tendenza', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'fr-FR', 'Tendances', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'es-ES', 'Tendencia', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'de-DE', 'Trends', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_trending', 'pt-PT', 'Em alta', now(), 'initial-setup', now(), 'initial-setup', 1),

  ('system.entities.ai_model.sort_name', 'en-GB', 'Name A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'en-US', 'Name A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'it-IT', 'Nome A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'fr-FR', 'Nom A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'es-ES', 'Nombre A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'de-DE', 'Name A–Z', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.sort_name', 'pt-PT', 'Nome A–Z', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- NOTE: out-of-band write — invalidate Redis after running:
--   redis-cli --scan --pattern "translations:i18n:system:*" | xargs redis-cli DEL
