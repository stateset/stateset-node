// lib/resources/Lead.ts

export default class Leads {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async create(data: any) {
    return this.client.request('POST', 'leads', data);
  }

  async get(id: string) {
    return this.client.request('GET', `leads/${id}`);
  }

  async update(id: string, data: any) {
    return this.client.request('PUT', `leads/${id}`, data);
  }

  async list(params?: any) {
    return this.client.request('GET', 'leads', params);
  }

  async delete(id: string) {
    return this.client.request('DELETE', `leads/${id}`);
  }
}
