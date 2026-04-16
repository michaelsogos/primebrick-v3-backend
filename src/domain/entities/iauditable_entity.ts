import type { IDeletableEntity } from "./ideletable_entity.js";

export interface IAuditableEntity extends IDeletableEntity {
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
}

