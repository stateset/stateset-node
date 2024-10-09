// lib/resources/Fulfillment.ts

export default class Fulfillment {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'fulfillments', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `fulfillments/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `fulfillments/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'fulfillments', params);
    }
  
    async cancel(id: string) {
      return this.client.request('POST', `fulfillments/${id}/cancel`);
    }
  
    async createShipment(id: string, data: any) {
      return this.client.request('POST', `fulfillments/${id}/shipments`, data);
    }
  
    async getShipments(id: string) {
      return this.client.request('GET', `fulfillments/${id}/shipments`);
    }
  
    async updateTracking(id: string, data: any) {
      return this.client.request('PUT', `fulfillments/${id}/tracking`, data);
    }
  }