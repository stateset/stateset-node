import BaseIntegration from './BaseIntegration';

export default class ShopifyIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.shopify.com');
  }

  public async getProducts() {
    return this.request('GET', 'products');
  }

  public async createProduct(data: any) {
    return this.request('POST', 'products', data);
  }

  public async updateProduct(id: string, data: any) {
    return this.request('PUT', `products/${id}`, data);
  }

  public async deleteProduct(id: string) {
    return this.request('DELETE', `products/${id}`);
  }

  public async getOrders() {
    return this.request('GET', 'orders');
  }

  public async createOrder(data: any) {
    return this.request('POST', 'orders', data);
  }

  public async updateOrder(id: string, data: any) {
    return this.request('PUT', `orders/${id}`, data);
  }

  public async deleteOrder(id: string) {
    return this.request('DELETE', `orders/${id}`);
  }

  public async getCustomers() {
    return this.request('GET', 'customers');
  }

  public async createCustomer(data: any) {
    return this.request('POST', 'customers', data);
  }

  public async updateCustomer(id: string, data: any) {
    return this.request('PUT', `customers/${id}`, data);
  }

  public async deleteCustomer(id: string) {
    return this.request('DELETE', `customers/${id}`);
  }

  public async getInventory() {
    return this.request('GET', 'inventory');
  } 

  public async createInventory(data: any) {
    return this.request('POST', 'inventory', data);
  }

  public async updateInventory(id: string, data: any) {
    return this.request('PUT', `inventory/${id}`, data);
  }

  public async deleteInventory(id: string) {
    return this.request('DELETE', `inventory/${id}`);

  }
}