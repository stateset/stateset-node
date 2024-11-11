import { stateset } from '../../stateset-client';

class ShipTo {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'ship_to');
  }

  async get(id: string) {
    return this.stateset.request('GET', `ship_to/${id}`);
  }

  async create(shipToData: any) {
    return this.stateset.request('POST', 'ship_to', shipToData);
  }

  async update(id: string, shipToData: any) {
    return this.stateset.request('PUT', `ship_to/${id}`, shipToData);
  }

  async delete(id: string) {
    return this.stateset.request('DELETE', `ship_to/${id}`);
  }

}

export default ShipTo;
