/**
 * Inventory: consume items, low-stock alerts, audit trail.
 */
import Inventory, { IInventory } from '../models/inventoryModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logActivityServer } from '../utils/auditLog.js';

async function triggerLowStockAlert(buildingId: string, item: IInventory): Promise<void> {
  await logActivityServer('LOW_STOCK_ALERT', 'INVENTORY', {
    buildingId,
    itemName: item.itemName,
    quantity: item.quantity,
    minThreshold: item.minThreshold,
  });
}

export async function consumeItem(
  buildingId: string,
  itemId: string,
  amount: number,
  reason: string
): Promise<IInventory> {
  const item = await tenantContext.run({ buildingId }, async () => {
    const doc = await Inventory.findOne({ _id: itemId });
    if (!doc) throw new Error('מלאי חסר או לא קיים');
    if (doc.quantity < amount) throw new Error('מלאי חסר או לא קיים');
    doc.quantity -= amount;
    await doc.save();
    if (doc.quantity <= doc.minThreshold) {
      await triggerLowStockAlert(buildingId, doc);
    }
    return doc;
  });
  await logActivityServer('INVENTORY_CONSUMPTION', 'INVENTORY', {
    buildingId,
    itemName: item.itemName,
    amount,
    reason,
  });
  return item;
}
