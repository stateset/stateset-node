import { BaseResource } from './BaseResource';

// lib/resources/Settlement.ts

export default class Settlements extends BaseResource {
  constructor(client: any) {
    super(client, 'settlements', 'settlements');
  }

  async consolidate(startDate: string, endDate: string) {
    return this.client.request('POST', 'settlements/consolidate', { startDate, endDate });
  }

  async reconcile(startDate: string, endDate: string) {
    return this.client.request('POST', 'settlements/reconcile', { startDate, endDate });
  }
}
