/**
 * Register every @Entity class so database patch tooling can scan them.
 * Add new entities here after creating the class file.
 */
import "reflect-metadata";

import type { EntityClass } from "./entity-decorators.js";
import { CustomerEntity } from "../../modules/customers/customer_entity.js";

export const ENTITY_REGISTRY: readonly EntityClass[] = [CustomerEntity];
