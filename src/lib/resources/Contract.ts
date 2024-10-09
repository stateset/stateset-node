// lib/resources/Contract.ts

export default class Contracts {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'contracts', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `contracts/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `contracts/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'contracts', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `contracts/${id}`);
    }

  }