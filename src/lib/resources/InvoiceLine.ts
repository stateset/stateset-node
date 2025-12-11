import { BaseResource } from './BaseResource';

// lib/resources/InvoiceLine.ts

export default class InvoiceLines extends BaseResource {
  constructor(client: any) {
    super(client, 'invoice-lines', 'invoice-lines');
  }

  async getPayouts(id: string) {
    return this.client.request('GET', `invoice-lines/${id}/payouts`);
  }

  async updatePayouts(id: string, data: any) {
    return this.client.request('PUT', `invoice-lines/${id}/payouts`, data);
  }
}
