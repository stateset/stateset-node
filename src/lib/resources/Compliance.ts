// lib/resources/Compliance.ts

export default class Compliance {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'compliance', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `compliance/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `compliance/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'compliance', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `compliance/${id}`);
    }
  
  }