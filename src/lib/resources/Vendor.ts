// lib/resources/Vendor.ts

export default class Vendors {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async create(data: any) {
    return this.client.request('POST', 'vendors', data);
  }

  async get(id: string) {
    return this.client.request('GET', `vendors/${id}`);
  }

  async update(id: string, data: any) {
    return this.client.request('PUT', `vendors/${id}`, data);
  }

  async list(params?: any) {
    return this.client.request('GET', 'vendors', params);
  }

  async delete(id: string) {
    return this.client.request('DELETE', `vendors/${id}`);
  }

  async getPerformanceMetrics(id: string) {
    return this.client.request('GET', `vendors/${id}/performance`);
  }

  async updatePaymentTerms(id: string, data: any) {
    return this.client.request('PUT', `vendors/${id}/payment-terms`, data);
  }
}