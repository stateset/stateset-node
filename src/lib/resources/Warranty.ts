import { stateset } from '../../stateset-client';

class Warranties {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'warranties');
  }

  async get(warrantyId: string) {
    return this.stateset.request('GET', `warranties/${warrantyId}`);
  }

  async create(warrantyData: any) {
    return this.stateset.request('POST', 'warranties', warrantyData);
  }

  async update(warrantyId: string, warrantyData: any) {
    return this.stateset.request('PUT', `warranties/${warrantyId}`, warrantyData);
  }

  async delete(warrantyId: string) {
    return this.stateset.request('DELETE', `warranties/${warrantyId}`);
  }

}

export default Warranties;