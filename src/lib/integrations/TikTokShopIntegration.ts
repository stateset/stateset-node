import BaseIntegration from './BaseIntegration';

export default class TikTokShopIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.tiktokshop.com');
  }

  public async getProducts() {
    return this.request('GET', 'products');
  }

  public async createProduct(data: any) {
    return this.request('POST', 'products', data);
  }

  public async getOrders() {
    return this.request('GET', 'orders');
  }

  public async createOrder(data: any) {
    return this.request('POST', 'orders', data);
  }

  public async getCustomers() {
    return this.request('GET', 'customers');
  }

  public async createCustomer(data: any) {
    return this.request('POST', 'customers', data);
  }

  public async getReviews() {
    return this.request('GET', 'reviews');
  }

  public async createReview(data: any) {
    return this.request('POST', 'reviews', data);
  }
  
  public async getFulfillments() {
    return this.request('GET', 'fulfillments');
  }

  public async createFulfillment(data: any) {
    return this.request('POST', 'fulfillments', data);
  }
  
}