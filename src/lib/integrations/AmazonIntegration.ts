import BaseIntegration from './BaseIntegration';

export default class AmazonIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.amazon.com');
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

  public async getInventory() {
    return this.request('GET', 'inventory');
  }

  public async createInventory(data: any) {
    return this.request('POST', 'inventory', data);
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

  public async getReports() {
    return this.request('GET', 'reports');
  }

  public async createReport(data: any) {
    return this.request('POST', 'reports', data);
  }  
  
}