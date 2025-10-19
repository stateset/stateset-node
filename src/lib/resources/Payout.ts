// lib/resources/Payout.ts

export default class Payouts {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async create(data: any) {
    return this.client.request('POST', 'payouts', data);
  }

  async get(id: string) {
    return this.client.request('GET', `payouts/${id}`);
  }

  async update(id: string, data: any) {
    return this.client.request('PUT', `payouts/${id}`, data);
  }

  async list(params?: any) {
    return this.client.request('GET', 'payouts', params);
  }

  async delete(id: string) {
    return this.client.request('DELETE', `payouts/${id}`);
  }

  async fetchFromPlatform(platform: string, startDate: string, endDate: string) {
    return this.client.request('POST', `payouts/fetch/${platform}`, { startDate, endDate });
  }
}
