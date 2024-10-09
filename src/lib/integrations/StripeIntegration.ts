import BaseIntegration from './BaseIntegration';

export default class StripeIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.stripe.com');
  }

  public async getOrders() {
    return this.request('GET', 'orders');
  }

  public async createOrder(data: any) {
    return this.request('POST', 'orders', data);
  }
}