export interface StockCheckItem {
  productVariantId: string;
  requestedQty: number;
  stockOnHand: number;
  activeReservations: number;
}

export interface StockCheckResult {
  available: boolean;
  unavailableItems: {
    productVariantId: string;
    requestedQty: number;
    availableQty: number;
  }[];
}

export function checkStockAvailability(items: StockCheckItem[]): StockCheckResult {
  const unavailableItems: StockCheckResult["unavailableItems"] = [];

  for (const item of items) {
    const availableQty = item.stockOnHand - item.activeReservations;

    if (availableQty < item.requestedQty) {
      unavailableItems.push({
        productVariantId: item.productVariantId,
        requestedQty: item.requestedQty,
        availableQty: Math.max(0, availableQty),
      });
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
}
