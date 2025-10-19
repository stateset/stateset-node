import type { ApiClientLike } from '../../types';

interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  currency?: string;
  tax_rate?: number;
  discount?: number;
  total_amount: number;
  description?: string;
  uom?: string; // Unit of Measure
  requested_delivery_date?: string;
  notes?: string;
  status?: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  metadata?: Record<string, any>;
}

class PurchaseOrderLines {
  constructor(private stateset: ApiClientLike) {}

  /**
   * List all purchase order lines
   * @param purchaseOrderId - Purchase order ID
   * @returns Array of PurchaseOrderLineItem objects
   */
  async list(purchaseOrderId?: string): Promise<PurchaseOrderLineItem[]> {
    const endpoint = purchaseOrderId
      ? `purchase_orders/${purchaseOrderId}/line_items`
      : 'purchase_order_line_items';
    return this.stateset.request('GET', endpoint);
  }

  /**
   * Get a purchase order line by ID
   * @param lineItemId - Purchase order line ID
   * @returns PurchaseOrderLineItem object
   */
  async get(lineItemId: string): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('GET', `purchase_order_line_items/${lineItemId}`);
  }

  /**
   * Create a new purchase order line
   * @param lineItemData - PurchaseOrderLineItem object
   * @returns PurchaseOrderLineItem object
   */
  async create(lineItemData: Omit<PurchaseOrderLineItem, 'id'>): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('POST', 'purchase_order_line_items', lineItemData);
  }

  /**
   * Update a purchase order line
   * @param lineItemId - Purchase order line ID
   * @param lineItemData - Partial<PurchaseOrderLineItem> object
   * @returns PurchaseOrderLineItem object
   */
  async update(
    lineItemId: string,
    lineItemData: Partial<PurchaseOrderLineItem>
  ): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}`, lineItemData);
  }

  /**
   * Delete a purchase order line
   * @param lineItemId - Purchase order line ID
   */
  async delete(lineItemId: string): Promise<void> {
    return this.stateset.request('DELETE', `purchase_order_line_items/${lineItemId}`);
  }

  /**
   * Bulk create purchase order lines
   * @param purchaseOrderId - Purchase order ID
   * @param lineItems - Array of PurchaseOrderLineItem objects
   * @returns Array of PurchaseOrderLineItem objects
   */
  async bulkCreate(
    purchaseOrderId: string,
    lineItems: Array<Omit<PurchaseOrderLineItem, 'id' | 'purchase_order_id'>>
  ): Promise<PurchaseOrderLineItem[]> {
    return this.stateset.request('POST', `purchase_orders/${purchaseOrderId}/line_items/bulk`, {
      line_items: lineItems,
    });
  }

  /**
   * Update the quantity received for a purchase order line
   * @param lineItemId - Purchase order line ID
   * @param quantityReceived - Quantity received
   * @returns PurchaseOrderLineItem object
   */
  async updateQuantityReceived(
    lineItemId: string,
    quantityReceived: number
  ): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}/receive`, {
      quantity_received: quantityReceived,
    });
  }
}

export default PurchaseOrderLines;
