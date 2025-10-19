// lib/resources/Promotion.ts

export default class Promotions {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async create(data: any) {
    return this.client.request('POST', 'promotions', data);
  }

  async get(id: string) {
    return this.client.request('GET', `promotions/${id}`);
  }

  async update(id: string, data: any) {
    return this.client.request('PUT', `promotions/${id}`, data);
  }

  async list(params?: any) {
    return this.client.request('GET', 'promotions', params);
  }

  async delete(id: string) {
    return this.client.request('DELETE', `promotions/${id}`);
  }

  async getInventory(id: string) {
    return this.client.request('GET', `promotions/${id}/inventory`);
  }

  async updateInventory(id: string, data: any) {
    return this.client.request('PUT', `promotions/${id}/inventory`, data);
  }
}
