// lib/resources/WasteAndScrap.ts

export default class WasteAndScrap {
    private client: any;
  
    constructor(client: any) {
      this.client = client;
    }
  
    async create(data: any) {
      return this.client.request('POST', 'waste-and-scrap', data);
    }
  
    async get(id: string) {
      return this.client.request('GET', `waste-and-scrap/${id}`);
    }
  
    async update(id: string, data: any) {
      return this.client.request('PUT', `waste-and-scrap/${id}`, data);
    }
  
    async list(params?: any) {
      return this.client.request('GET', 'waste-and-scrap', params);
    }
  
    async delete(id: string) {
      return this.client.request('DELETE', `waste-and-scrap/${id}`);
    }
  
    async generateReport(params?: any) {
      return this.client.request('GET', 'waste-and-scrap/report', params);
    }
  
    async recordDisposal(id: string, data: any) {
      return this.client.request('POST', `waste-and-scrap/${id}/dispose`, data);
    }
  }