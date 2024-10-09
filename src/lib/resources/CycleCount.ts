// lib/resources/CycleCount.ts

export default class CycleCounts {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'cycle-counts', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `cycle-counts/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `cycle-counts/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'cycle-counts', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `cycle-counts/${id}`);
    }
  
    async complete(id: string, data: any) {
      return this.client.request('POST', `cycle-counts/${id}/complete`, data);
    }
  
    async reconcile(id: string) {
      return this.client.request('POST', `cycle-counts/${id}/reconcile`);
    }
  }