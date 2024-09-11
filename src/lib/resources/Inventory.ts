import { stateset } from '../../stateset-client';

class Inventory {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'inventory');
  }

  async get(inventoryId: string) {
    return this.stateset.request('GET', `inventory/${inventoryId}`);
  }

  async create(inventoryData: any) {
    return this.stateset.request('POST', 'inventory', inventoryData);
  }

  async update(inventoryId: string, inventoryData: any) {
    return this.stateset.request('PUT', `inventory/${inventoryId}`, inventoryData);
  }

  async delete(inventoryId: string) {
    return this.stateset.request('DELETE', `inventory/${inventoryId}`);
  }

}

export default Inventory;