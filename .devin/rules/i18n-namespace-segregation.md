# Devin Rule: i18n Namespace Segregation

## Trigger
- Applies whenever AI agent writes or cites a translation key: `t()`/`$t()`/`tFn()` calls, `*_key`/`*Key`/`tooltip*` fields, `db-meta` seed patches, entity metadata, nav/registration payloads.

## Canonical doc
**`docs/ai/i18n-namespace-segregation.md` — read it before acting.** This file is a
pointer; the normative text lives in the canonical doc.

## Enforcement
- AI agent MUST cite only `app.*` or the owning schema's `*` namespace in module code; `system.*` is BE/shell-only, `custom.*` is customer-only.
- AI agent MUST seed module-owned keys in the module's own `db-meta/patches/` targeting its own schema — never `public`/`system`.
- AI agent MUST use `findTranslations` (matcher-gated) for any cross-namespace read — never a bulk foreign dict.
- AI agent MUST NOT add `system`/`custom` to a module's `i18n_namespaces` allowlist.
