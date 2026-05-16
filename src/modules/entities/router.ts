import { Router } from "express";
import { getPool } from "../../db/pool.js";
import { Repository } from "../../db/repository/repository.js";
import { validateBody } from "../../http/validation.js";
import { asyncHandler } from "../../http/async-handler.js";
import { z } from "zod";

// Schema for bulk delete request body
const BulkDeleteBodySchema = z.object({
  uuids: z.array(z.string().uuid()).min(1).max(100),
});

type BulkDeleteBody = z.infer<typeof BulkDeleteBodySchema>;

// Schema for bulk restore request body
const BulkRestoreBodySchema = z.object({
  uuids: z.array(z.string().uuid()).min(1).max(100),
});

type BulkRestoreBody = z.infer<typeof BulkRestoreBodySchema>;

// Entity registry: maps entity name (from URL) to entity class
// This will be extended as more entities are added
import { CustomerEntity } from "../customers/customer_entity.js";

const ENTITY_REGISTRY: Record<string, new () => any> = {
  customer: CustomerEntity,
};

export function entitiesRouter() {
  const router = Router();
  const getRepo = () => new Repository(getPool());

  router.post(
    "/api/v1/entities/:entity/bulk-delete",
    validateBody(BulkDeleteBodySchema),
    asyncHandler(async (req, res) => {
      const entity = req.params.entity as string;
      const { uuids } = req.body as BulkDeleteBody;
      const deletedBy = (req as any).user?.id || "system";

      // Validate entity name
      const EntityClass = ENTITY_REGISTRY[entity];
      if (!EntityClass) {
        res.status(400).json({
          type: '/errors/invalid-entity',
          title: 'Invalid entity',
          status: 400,
          detail: `Entity "${entity}" is not supported for bulk operations`,
          severity: 'MEDIUM',
        });
        return;
      }

      const repo = getRepo();
      const results = {
        success: [] as string[],
        failed: [] as { uuid: string; error: string }[],
      };

      // Process each UUID
      for (const uuid of uuids) {
        try {
          await repo.delete(EntityClass, uuid, deletedBy);
          results.success.push(uuid);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          console.error(`Bulk delete error for ${entity}:${uuid}:`, error);
          
          // Check for specific SQL errors that should return 422
          const isNotFoundError = errorMessage.includes("No rows affected") || errorMessage.includes("record not found");
          const isForeignKeyError = errorMessage.includes("foreign key") || errorMessage.includes("FK") || errorMessage.includes("violates foreign key");
          
          if (isNotFoundError || isForeignKeyError) {
            results.failed.push({ uuid, error: errorMessage });
          } else {
            // For other errors (database errors, connection issues, etc.), return 500 immediately
            console.error(`Bulk delete failed for ${entity}:${uuid}:`, error);
            res.status(500).json({
              type: '/errors/bulk-delete-failed',
              title: 'Bulk delete failed',
              status: 500,
              detail: 'An unexpected error occurred during bulk delete',
              instance: `/api/v1/entities/${entity}/bulk-delete`,
              internal_code: 'BULK_DELETE_FAILED',
              severity: 'HIGH',
              extra: {
                issues: {
                  error_details: errorMessage
                }
              }
            });
            return;
          }
        }
      }

      // If all operations completed (some may have failed with 422-type errors), return the results
      if (results.failed.length > 0) {
        res.status(422).json({
          type: '/errors/partial-failure',
          title: 'Partial bulk delete failure',
          status: 422,
          detail: `${results.failed.length} of ${uuids.length} records could not be deleted`,
          instance: `/api/v1/entities/${entity}/bulk-delete`,
          internal_code: 'PARTIAL_FAILURE',
          severity: 'HIGH',
          extra: {
            issues: results
          }
        });
      } else {
        res.status(204).send();
      }
    })
  );

  router.post(
    "/api/v1/entities/:entity/bulk-restore",
    validateBody(BulkRestoreBodySchema),
    asyncHandler(async (req, res) => {
      const entity = req.params.entity as string;
      const { uuids } = req.body as BulkRestoreBody;
      const restoredBy = (req as any).user?.id || "system";

      // Validate entity name
      const EntityClass = ENTITY_REGISTRY[entity];
      if (!EntityClass) {
        res.status(400).json({
          type: '/errors/invalid-entity',
          title: 'Invalid entity',
          status: 400,
          detail: `Entity "${entity}" is not supported for bulk operations`,
          severity: 'MEDIUM',
        });
        return;
      }

      const repo = getRepo();
      const results = {
        success: [] as string[],
        failed: [] as { uuid: string; error: string }[],
      };

      // Process each UUID
      for (const uuid of uuids) {
        try {
          await repo.restore(EntityClass, uuid, restoredBy);
          results.success.push(uuid);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          console.error(`Bulk restore error for ${entity}:${uuid}:`, error);
          
          // Check for specific SQL errors that should return 422
          const isNotFoundError = errorMessage.includes("No rows affected") || errorMessage.includes("record not found");
          
          if (isNotFoundError) {
            results.failed.push({ uuid, error: errorMessage });
          } else {
            // For other errors (database errors, connection issues, etc.), return 500 immediately
            console.error(`Bulk restore failed for ${entity}:${uuid}:`, error);
            res.status(500).json({
              type: '/errors/bulk-restore-failed',
              title: 'Bulk restore failed',
              status: 500,
              detail: 'An unexpected error occurred during bulk restore',
              instance: `/api/v1/entities/${entity}/bulk-restore`,
              internal_code: 'BULK_RESTORE_FAILED',
              severity: 'HIGH',
              extra: {
                issues: {
                  error_details: errorMessage
                }
              }
            });
            return;
          }
        }
      }

      // If all operations completed (some may have failed with 422-type errors), return the results
      if (results.failed.length > 0) {
        res.status(422).json({
          type: '/errors/partial-failure',
          title: 'Partial bulk restore failure',
          status: 422,
          detail: `${results.failed.length} of ${uuids.length} records could not be restored`,
          instance: `/api/v1/entities/${entity}/bulk-restore`,
          internal_code: 'PARTIAL_FAILURE',
          severity: 'HIGH',
          extra: {
            issues: results
          }
        });
      } else {
        res.status(204).send();
      }
    })
  );

  return router;
}
