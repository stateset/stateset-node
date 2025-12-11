import { BaseResource } from './BaseResource';

// lib/resources/Payout.ts

export default class Payouts extends BaseResource {
  constructor(client: any) {
    super(client, 'payouts', 'payouts');
  }

  async fetchFromPlatform(platform: string, startDate: string, endDate: string) {
    return this.client.request('POST', `payouts/fetch/${platform}`, { startDate, endDate });
  }
}
