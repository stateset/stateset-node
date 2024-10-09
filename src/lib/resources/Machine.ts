// lib/resources/Machine.ts

export default class Machines {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'machines', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `machines/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `machines/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'machines', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `machines/${id}`);
    }
  
    async logRuntime(id: string, data: any) {
      return this.client.request('POST', `machines/${id}/runtime`, data);
    }
  
    async scheduleMaintenance(id: string, data: any) {
      return this.client.request('POST', `machines/${id}/maintenance`, data);
    }
  
    async getPerformanceMetrics(id: string, params?: any) {
      return this.client.request('GET', `machines/${id}/performance`, params);
    }
  }