# Devin Rule: Translation Key Convention — snake_case singular

## Trigger
- Applies to ALL translation keys in BE meta files and any BE code that returns i18n keys to the FE.

## Canonical doc
**`docs/ai/translation-key-convention.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- AI agent MUST use snake_case singular for all translation key entity segments.
- AI agent MUST include `translation_key` in every new BE meta file.
- AI agent MUST NOT use camelCase or PascalCase in translation key entity segments.
- AI agent MUST NOT use snake_case plural in translation key entity segments.
- When reviewing existing code, flag any camelCase or plural entity segments in translation keys as violations.
