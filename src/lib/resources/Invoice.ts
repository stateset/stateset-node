// lib/resources/Invoice.ts

export default class Invoices {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
        return this.client.request('POST', 'invoices', data);
    }
  
    async get(id: string) {
        return this.client.request('GET', `invoices/${id}`);
    }
  
    async update(id: string, data: any) {
        return this.client.request('PUT', `invoices/${id}`, data);
    }
  
    async list(params?: any) {
        return this.client.request('GET', 'invoices', params);
    }
  
    async delete(id: string) {
        return this.client.request('DELETE', `invoices/${id}`);
    }
  
    async getLines(id: string) {
        return this.client.request('GET', `invoices/${id}/lines`);
    }
  
    async updateLines(id: string, data: any) {
        return this.client.request('PUT', `invoices/${id}/lines`, data);
    }
  }