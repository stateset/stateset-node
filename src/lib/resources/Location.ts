// lib/resources/Location.ts

export default class Locations {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'locations', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `locations/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `locations/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'locations', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `locations/${id}`);
    }
  
    async getInventory(id: string) {
      return this.client.request('GET', `locations/${id}/inventory`);
    }
  
    async assignProduct(id: string, productId: string, data: any) {
      return this.client.request('POST', `locations/${id}/products/${productId}`, data);
    }
  }