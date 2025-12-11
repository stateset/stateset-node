import { BaseResource } from './BaseResource';

// lib/resources/Promotion.ts

export default class Promotions extends BaseResource {
  constructor(client: any) {
    super(client, 'promotions', 'promotions');
  }

  async getInventory(id: string) {
    return this.client.request('GET', `promotions/${id}/inventory`);
  }

  async updateInventory(id: string, data: any) {
    return this.client.request('PUT', `promotions/${id}/inventory`, data);
  }
}
