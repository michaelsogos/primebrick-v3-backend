/**
 * Register every @Entity class so database patch tooling can scan them.
 * Add new entities here after creating the class file.
 */
import "reflect-metadata";

import type { EntityClass } from "@primebrick/dal-pg";
import { AiCerebellumEntity } from "../../modules/ai-cerebellum/ai_cerebellum_entity.js";
import { AiModelEntity } from "../../modules/ai-models/ai_model_entity.js";
import { AuthEventEntity } from "../../modules/auth/auth_event_entity.js";
import { ConfigEntryEntity } from "../../modules/auth/config_entry_entity.js";
import { MfaActionAuthorizationEntity } from "../../modules/auth/mfa_action_authorization_entity.js";
import { OrganizationEntity } from "../../modules/auth/organization_entity.js";
import { RoleMappingEntity } from "../../modules/auth/role_mapping_entity.js";
import { UserInvitationEntity } from "../../modules/auth/user_invitation_entity.js";
import { UserMfaFactorEntity } from "../../modules/auth/user_mfa_factor_entity.js";
import { UserPasskeyEntity } from "../../modules/auth/user_passkey_entity.js";
import { UserProfileEntity } from "../../modules/auth/user_profile_entity.js";
import { CustomerEntity } from "../../modules/customers/customer_entity.js";
import { ServiceRegistryEntity } from "../../modules/system/service_registry_entity.js";

export const ENTITY_REGISTRY = [
  AiCerebellumEntity,
  AiModelEntity,
  AuthEventEntity,
  ConfigEntryEntity,
  MfaActionAuthorizationEntity,
  OrganizationEntity,
  RoleMappingEntity,
  UserInvitationEntity,
  UserMfaFactorEntity,
  UserPasskeyEntity,
  UserProfileEntity,
  CustomerEntity,
  ServiceRegistryEntity,
] as const;
