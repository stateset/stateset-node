import BaseIntegration from './BaseIntegration';

export default class ShipStationIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.shipstation.com');
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

  public async getShipments() {
    return this.request('GET', 'shipments');
  }

  public async createShipment(data: any) {
    return this.request('POST', 'shipments', data);
  }

  public async getCarriers() {
    return this.request('GET', 'carriers');
  }

  public async getRates(data: any) {
    return this.request('POST', 'rates', data);
  }
  
}