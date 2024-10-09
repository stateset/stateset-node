// lib/resources/Supplier.ts

export default class Suppliers {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'suppliers', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `suppliers/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `suppliers/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'suppliers', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `suppliers/${id}`);
    }
  
    async getPerformanceMetrics(id: string) {
      return this.client.request('GET', `suppliers/${id}/performance`);
    }
  
    async updatePaymentTerms(id: string, data: any) {
      return this.client.request('PUT', `suppliers/${id}/payment-terms`, data);
    }
  
    async listProducts(id: string) {
      return this.client.request('GET', `suppliers/${id}/products`);
    }
  }