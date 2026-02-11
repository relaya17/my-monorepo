import type { Schema } from 'mongoose';
import { tenantContext } from '../middleware/tenantMiddleware.js';

/** Mongoose query context in pre('find') etc. – minimal shape to avoid `any`. */
interface TenantQueryContext {
  where?: (conditions: Record<string, string>) => unknown;
}

/** Mongoose aggregate context in pre('aggregate'). */
interface TenantAggregateContext {
  pipeline?: () => unknown[];
}

/** Mongoose document context in pre('save'). */
interface TenantDocumentContext {
  buildingId?: string;
}

/**
 * Mongoose plugin – full isolation (Enterprise).
 * Injects buildingId into every find / findOne / findOneAndUpdate / updateMany / countDocuments / aggregate.
 */
export function multiTenancyPlugin(schema: Schema) {
  if (!schema.paths['buildingId']) {
    schema.add({
      buildingId: { type: String, required: true, default: 'default', index: true },
    });
  }

  const getBuildingId = () => tenantContext.getStore()?.buildingId ?? 'default';

  const filterByTenant = function (this: unknown, next: (err?: Error) => void) {
    const q = this as TenantQueryContext;
    const currentBuildingId = getBuildingId();
    if (currentBuildingId && currentBuildingId !== '*') q.where?.({ buildingId: currentBuildingId });
    next();
  };

  schema.pre('find', filterByTenant);
  schema.pre('findOne', filterByTenant);
  schema.pre('findOneAndUpdate', filterByTenant);
  schema.pre('updateMany', filterByTenant);
  schema.pre('countDocuments', filterByTenant);
  schema.pre('distinct', filterByTenant);
  schema.pre('deleteOne', filterByTenant);
  schema.pre('deleteMany', filterByTenant);
  schema.pre('updateOne', filterByTenant);
  schema.pre('findOneAndDelete', filterByTenant);

  schema.pre('aggregate', function (next) {
    const agg = this as unknown as TenantAggregateContext;
    const currentBuildingId = getBuildingId();
    if (currentBuildingId && currentBuildingId !== '*') agg.pipeline?.().unshift({ $match: { buildingId: currentBuildingId } });
    next();
  });

  schema.pre('save', function (next) {
    const doc = this as TenantDocumentContext;
    const currentBuildingId = getBuildingId();
    if (!doc.buildingId && currentBuildingId !== '*') doc.buildingId = currentBuildingId;
    next();
  });
}

