import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { Repository } from "../../db/repository/repository.js";
import { CustomerEntity } from "../customers/customer_entity.js";

const ENTITY_REGISTRY: Record<string, new () => any> = {
  customer: CustomerEntity,
};

export function entitiesRouter() {
  const router = Router();
  const getRepo = () => new Repository(getPool());

  // Placeholder for future entity-specific routes that are not bulk operations
  // Bulk operations have been moved to module-specific routers (e.g., customers router)

  return router;
}
