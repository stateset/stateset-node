import { BaseResource } from './BaseResource';

// lib/resources/Location.ts

export default class Locations extends BaseResource {
  constructor(client: any) {
    super(client, 'locations', 'locations');
  }

  async getInventory(id: string) {
    return this.client.request('GET', `locations/${id}/inventory`);
  }

  async assignProduct(id: string, productId: string, data: any) {
    return this.client.request('POST', `locations/${id}/products/${productId}`, data);
  }
}
