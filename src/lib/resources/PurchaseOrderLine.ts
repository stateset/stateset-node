import { stateset } from '../../stateset-client';

class PurchaseOrderLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'purchase_order_line_items');
  }

  async get(purchaseOrderLineId: string) {
    return this.stateset.request('GET', `purchase_order_line_items/${purchaseOrderLineId}`);
  }

  async create(purchaseOrderLineData: any) {
    return this.stateset.request('POST', 'purchase_order_line_items', purchaseOrderLineData);
  }

  async update(purchaseOrderLineId: string, purchaseOrderLineData: any) {
    return this.stateset.request('PUT', `purchase_order_line_items/${purchaseOrderLineId}`, purchaseOrderLineData);
  }

  async delete(purchaseOrderLineId: string) {
            return this.stateset.request('DELETE', `purchase_order_line_items/${purchaseOrderLineId}`);
    }

}

export default PurchaseOrderLines;