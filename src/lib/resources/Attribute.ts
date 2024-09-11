import { stateset } from '../../stateset-client';

class Attributes {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'attributes');
  }

  async get(attributeId: string) {
    return this.stateset.request('GET', `attributes/${attributeId}`);
  }

  async create(attributeData: any) {
    return this.stateset.request('POST', 'attributes', attributeData);
  }

  async update(attributeId: string, attributeData: any) {
    return this.stateset.request('PUT', `attributes/${attributeId}`, attributeData);
  }

  async delete(attributeId: string) {
        return this.stateset.request('DELETE', `attributes/${attributeId}`);
  }

}

export default Attributes;