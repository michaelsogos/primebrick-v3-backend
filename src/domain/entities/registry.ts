/**
 * Register every @Entity class so database patch tooling can scan them.
 * Add new entities here after creating the class file.
 */
import "reflect-metadata";

import type { EntityClass } from "./entity-decorators.js";
import { CustomerEntity } from "../../modules/customers/customer_entity.js";
import { UserProfileEntity } from "../../modules/auth/user_profile_entity.js";
import { RoleMappingEntity } from "../../modules/auth/role_mapping_entity.js";
import { OrganizationEntity } from "../../modules/auth/organization_entity.js";

export const ENTITY_REGISTRY = [
  CustomerEntity,
  UserProfileEntity,
  RoleMappingEntity,
  OrganizationEntity,
] as const;
