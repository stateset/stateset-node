// lib/resources/InvoiceLine.ts

export default class InvoiceLines {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'invoice-lines', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `invoice-lines/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `invoice-lines/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'invoice-lines', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `invoice-lines/${id}`);
    }
  
    async getPayouts(id: string) {
      return this.client.request('GET', `invoice-lines/${id}/payouts`);
    }
  
    async updatePayouts(id: string, data: any) {
      return this.client.request('PUT', `invoice-lines/${id}/payouts`, data);
    }
  }