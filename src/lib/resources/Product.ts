// lib/resources/Product.ts

export default class Products {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'products', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `products/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `products/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'products', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `products/${id}`);
    }
  
    async getInventory(id: string) {
      return this.client.request('GET', `products/${id}/inventory`);
    }
  
    async updateInventory(id: string, data: any) {
      return this.client.request('PUT', `products/${id}/inventory`, data);
    }
  }