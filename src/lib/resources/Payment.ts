// lib/resources/Payment.ts

export default class Payments {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'payments', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `payments/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `payments/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'payments', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `payments/${id}`);
    }
  
    async getPayouts(id: string) {
      return this.client.request('GET', `payments/${id}/payouts`);
    }
  
    async updatePayouts(id: string, data: any) {
      return this.client.request('PUT', `payments/${id}/payouts`, data);
    }
  }