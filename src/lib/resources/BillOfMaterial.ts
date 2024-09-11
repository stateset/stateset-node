import { stateset } from '../../stateset-client';

class BillOfMaterials {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'billofmaterials');
  }

  async get(billOfMaterialId: string) {
    return this.stateset.request('GET', `billofmaterials/${billOfMaterialId}`);
  }

  async create(billOfMaterialData: any) {
    return this.stateset.request('POST', 'billofmaterials', billOfMaterialData);
  }

  async update(billOfMaterialId: string, billOfMaterialData: any) {
    return this.stateset.request('PUT', `billofmaterials/${billOfMaterialId}`, billOfMaterialData);
  }

  async delete(billOfMaterialId: string) {
    return this.stateset.request('DELETE', `billofmaterials/${billOfMaterialId}`);
  }

}

export default BillOfMaterials;