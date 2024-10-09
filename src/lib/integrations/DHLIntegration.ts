import BaseIntegration from './BaseIntegration';

export default class DHLIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.dhl.com');
  }

  public async getRates(data: any) {    
    return this.request('POST', 'rates', data);
  }

  public async createShipment(data: any) {
    return this.request('POST', 'shipments', data);
  }

  public async getShipments() {
    return this.request('GET', 'shipments');
  }

  public async getShipment(shipmentId: string) {
    return this.request('GET', `shipments/${shipmentId}`);
  }

  public async cancelShipment(shipmentId: string) {
    return this.request('DELETE', `shipments/${shipmentId}`);
  }

  public async getTrackingInfo(shipmentId: string) {
    return this.request('GET', `shipments/${shipmentId}/tracking`);
  }
  
}