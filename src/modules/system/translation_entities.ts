/**
 * Translation entity classes — one per schema.
 *
 * The BE is the central CRUD gateway for all translation schemas.
 * `app` and `system` are static (always present). US modules are discovered
 * from `service_registry` at startup, and the BE creates entity classes for
 * them too (all extending `TranslationEntityBase` with the appropriate
 * `@Entity("translations", "{schema}")`).
 *
 * Schema = module boundary. The DAL's Repository resolves the schema natively
 * via getQualifiedTableName(entity) — no raw SQL, no string interpolation.
 */

import { Entity, TranslationEntityBase } from "@primebrick/dal-pg";

/** Public/application UI translations (schema: public). */
@Entity("translations", "public")
export class AppTranslationEntity extends TranslationEntityBase {}

/** Authenticated system/settings/entity translations (schema: system). */
@Entity("translations", "system")
export class SystemTranslationEntity extends TranslationEntityBase {}

/** Emailsender microservice translations (schema: emailsender). */
@Entity("translations", "emailsender")
export class EmailsenderTranslationEntity extends TranslationEntityBase {}
