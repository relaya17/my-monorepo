import type { Schema } from 'mongoose';
import { tenantContext } from '../middleware/tenantMiddleware.js';

/**
 * Mongoose plugin that enforces tenant isolation by `buildingId`.
 *
 * Notes:
 * - Adds `buildingId` with default "default" (to avoid breaking existing docs)
 * - Auto-injects `buildingId` into common query types
 * - Auto-sets `buildingId` on save/insert when missing
 */
export function multiTenancyPlugin(schema: Schema) {
  // Add buildingId field if model doesn't have it yet
  // (Some schemas already define it manually.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasPath = (schema as any).path?.('buildingId');
  if (!hasPath) {
    schema.add({
      buildingId: { type: String, index: true, default: 'default' },
    });
  }

  const getBuildingId = () => tenantContext.getStore()?.buildingId ?? 'default';

  const addTenantFilter = function (this: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = this as any;
    const buildingId = getBuildingId();
    q.where?.({ buildingId });
  };

  // Query isolation for most read operations
  schema.pre(/^find/, function (next) {
    addTenantFilter.call(this);
    next();
  });
  schema.pre('countDocuments', function (next) {
    addTenantFilter.call(this);
    next();
  });
  schema.pre('distinct', function (next) {
    addTenantFilter.call(this);
    next();
  });

  // Update/delete isolation
  for (const hook of ['updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndDelete'] as const) {
    schema.pre(hook, function (next) {
      addTenantFilter.call(this);
      next();
    });
  }

  // Aggregate isolation
  schema.pre('aggregate', function (next) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg = this as any;
    const buildingId = getBuildingId();
    agg.pipeline?.().unshift({ $match: { buildingId } });
    next();
  });

  // Ensure buildingId is set on new docs
  schema.pre('save', function (next) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = this as any;
    if (!doc.buildingId) doc.buildingId = getBuildingId();
    next();
  });
}

