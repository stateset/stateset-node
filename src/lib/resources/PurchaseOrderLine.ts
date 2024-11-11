import { stateset } from '../../stateset-client';

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
  constructor(private stateset: stateset) {}

  async list(purchaseOrderId?: string): Promise<PurchaseOrderLineItem[]> {
    const endpoint = purchaseOrderId 
      ? `purchase_orders/${purchaseOrderId}/line_items`
      : 'purchase_order_line_items';
    return this.stateset.request('GET', endpoint);
  }

  async get(lineItemId: string): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('GET', `purchase_order_line_items/${lineItemId}`);
  }

  async create(lineItemData: Omit<PurchaseOrderLineItem, 'id'>): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('POST', 'purchase_order_line_items', lineItemData);
  }

  async update(lineItemId: string, lineItemData: Partial<PurchaseOrderLineItem>): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}`, lineItemData);
  }

  async delete(lineItemId: string): Promise<void> {
    return this.stateset.request('DELETE', `purchase_order_line_items/${lineItemId}`);
  }

  async bulkCreate(purchaseOrderId: string, lineItems: Array<Omit<PurchaseOrderLineItem, 'id' | 'purchase_order_id'>>): Promise<PurchaseOrderLineItem[]> {
    return this.stateset.request('POST', `purchase_orders/${purchaseOrderId}/line_items/bulk`, { line_items: lineItems });
  }

  async updateQuantityReceived(lineItemId: string, quantityReceived: number): Promise<PurchaseOrderLineItem> {
    return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}/receive`, { quantity_received: quantityReceived });
  }
}

export default PurchaseOrderLines;