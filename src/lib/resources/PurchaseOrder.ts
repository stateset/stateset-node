import { stateset } from '../../stateset-client';

class PurchaseOrders {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'purchaseorders');
  }

  async get(purchaseOrderId: string) {
    return this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
  }

  async create(purchaseOrderData: any) {
    return this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
  }

  async update(purchaseOrderId: string, purchaseOrderData: any) {
    return this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
  }

  async delete(purchaseOrderId: string) {
        return this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
  }

}

export default PurchaseOrders;