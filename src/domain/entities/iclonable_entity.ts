/**
 * Interface for entities that support cloning/duplication.
 * The cloned_from field stores the UUID of the source record.
 */
export interface IClonableEntity {
  /**
   * UUID of the source record this entity was cloned from.
   * Null if this is an original record (not a clone).
   */
  cloned_from?: string;
}
