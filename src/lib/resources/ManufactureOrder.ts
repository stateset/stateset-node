import { stateset } from '../../stateset-client';

class ManufacturerOrders {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'manufacturerorders');
  }

  async get(manufacturerOrderId: string) {
    return this.stateset.request('GET', `manufacturerorders/${manufacturerOrderId}`);
  }

  async create(manufacturerOrderData: any) {
    return this.stateset.request('POST', 'manufacturerorders', manufacturerOrderData);
  }

  async update(manufacturerOrderId: string, manufacturerOrderData: any) {
    return this.stateset.request('PUT', `manufacturerorders/${manufacturerOrderId}`, manufacturerOrderData);
  }

  async delete(manufacturerOrderId: string) {
    return this.stateset.request('DELETE', `manufacturerorders/${manufacturerOrderId}`);
  }

}

export default ManufacturerOrders;