// lib/resources/Settlement.ts

export default class Settlements {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async create(data: any) {
    return this.client.request('POST', 'settlements', data);
  }

  async get(id: string) {
    return this.client.request('GET', `settlements/${id}`);
  }

  async update(id: string, data: any) {
    return this.client.request('PUT', `settlements/${id}`, data);
  }

  async list(params?: any) {
    return this.client.request('GET', 'settlements', params);
  }

  async delete(id: string) {
    return this.client.request('DELETE', `settlements/${id}`);
  }

  async consolidate(startDate: string, endDate: string) {
    return this.client.request('POST', 'settlements/consolidate', { startDate, endDate });
  }

  async reconcile(startDate: string, endDate: string) {
    return this.client.request('POST', 'settlements/reconcile', { startDate, endDate });
  }
}
