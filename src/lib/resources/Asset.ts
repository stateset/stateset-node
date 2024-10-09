// lib/resources/Asset.ts

export default class Assets {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'assets', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `assets/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `assets/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'assets', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `assets/${id}`);
    }
  
    async getInvenory(id: string) {
      return this.client.request('GET', `assets/${id}/inventory`);
    }
  
    async updateInventory(id: string, data: any) {
      return this.client.request('PUT', `assets/${id}/inventory`, data);
    }
  }