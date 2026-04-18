/**
 * Update BuildingStats when maintenance is closed or duplicate is prevented (for public impact metrics).
 */
import BuildingStats from '../models/buildingStatsModel.js';

const SAVINGS_PER_DUPLICATE_PREVENTED = 150;
const SAVINGS_PER_MAINTENANCE_CLOSED = 50;

export async function recordDuplicatePrevented(buildingId: string): Promise<void> {
  await BuildingStats.findOneAndUpdate(
    { buildingId },
    {
      $inc: {
        preventedFailuresCount: 1,
        moneySavedByAI: SAVINGS_PER_DUPLICATE_PREVENTED,
      },
    },
    { upsert: true, new: true }
  );
}

export async function recordMaintenanceClosed(buildingId: string, _actualCost?: number): Promise<void> {
  await BuildingStats.findOneAndUpdate(
    { buildingId },
    { $inc: { moneySavedByAI: SAVINGS_PER_MAINTENANCE_CLOSED } },
    { upsert: true, new: true }
  );
}
