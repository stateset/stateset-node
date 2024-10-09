// lib/resources/Pick.ts

export default class Picks {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'picks', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `picks/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `picks/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'picks', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `picks/${id}`);
    }
  
    async complete(id: string, data: any) {
      return this.client.request('POST', `picks/${id}/complete`, data);
    }
  
    async optimizeRoute(id: string) {
      return this.client.request('GET', `picks/${id}/optimize-route`);
    }
  }