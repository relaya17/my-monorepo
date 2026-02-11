/**
 * Soft-delete plugin (HSLL Enterprise – No-Delete Policy).
 * Adds isDeleted flag; default queries exclude deleted; CEO can query including deleted for audit.
 */
import type { Schema } from 'mongoose';

/** Mongoose query context in pre('find') etc. – minimal shape to avoid `any`. */
interface SoftDeleteQueryContext {
  getFilter?: () => Record<string, unknown>;
  where?: (path: string) => { ne: (value: boolean) => unknown };
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  });

  const filterNotDeleted = function (this: unknown, next: (err?: Error) => void) {
    const q = this as SoftDeleteQueryContext;
    const filter = q.getFilter?.() ?? {};
    if (filter.isDeleted === undefined) q.where?.('isDeleted').ne(true);
    next();
  };

  schema.pre('find', filterNotDeleted);
  schema.pre('findOne', filterNotDeleted);
  schema.pre('countDocuments', filterNotDeleted);
  schema.pre('findOneAndUpdate', filterNotDeleted);

  schema.methods.softDelete = async function (this: { save: () => Promise<unknown> }) {
    (this as { isDeleted?: boolean; deletedAt?: Date }).isDeleted = true;
    (this as { deletedAt?: Date }).deletedAt = new Date();
    return this.save();
  };
}
