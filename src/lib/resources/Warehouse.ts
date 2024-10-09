// lib/resources/Warehouse.ts

export default class Warehouses {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'warehouses', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `warehouses/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `warehouses/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'warehouses', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `warehouses/${id}`);
    }
  
    async getInventory(id: string) {
      return this.client.request('GET', `warehouses/${id}/inventory`);
    }
  
    async updateCapacity(id: string, data: any) {
      return this.client.request('PUT', `warehouses/${id}/capacity`, data);
    }
  }