import { stateset } from '../../stateset-client';

class Shipments {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'shipments');
  }

  async get(shipmentId: string) {
    return this.stateset.request('GET', `shipments/${shipmentId}`);
  }

  async create(shipmentData: any) {
    return this.stateset.request('POST', 'shipments', shipmentData);
  }

  async update(shipmentId: string, shipmentData: any) {
    return this.stateset.request('PUT', `shipments/${shipmentId}`, shipmentData);
  }

  async delete(shipmentId: string) {
    return this.stateset.request('DELETE', `shipments/${shipmentId}`);
  }

}

export default Shipments;