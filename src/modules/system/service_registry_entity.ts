import type { IAuditableEntity } from "../../domain/entities/iauditable_entity.js";
import { 
  Column, 
  Entity, 
  Key, 
  Unique, 
  AuditableField, 
  AuditableFieldType,
} from "../../domain/entities/entity-meta.js";

@Entity("service_registry")
export class ServiceRegistryEntity implements IAuditableEntity {
  @Key()
  id: number;

  @Unique()
  uuid: string;

  @Column({ length: 100, nullable: false })
  code: string;

  @Column({ nullable: false })
  base_url: string;

  @Column({ pgType: "jsonb", nullable: false })
  endpoints: Record<string, unknown>;

  @AuditableField(AuditableFieldType.CREATED_AT)
  created_at: Date;

  @AuditableField(AuditableFieldType.CREATED_BY)
  created_by: string;

  @AuditableField(AuditableFieldType.UPDATED_AT)
  updated_at: Date;

  @AuditableField(AuditableFieldType.UPDATED_BY)
  updated_by: string;

  @AuditableField(AuditableFieldType.VERSION)
  version: number;
}
