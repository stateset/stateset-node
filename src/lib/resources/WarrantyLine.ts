import { stateset } from '../../stateset-client';

class WarrantyLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'warranty_line_items');
  }

  async get(warrantyLineId: string) {
    return this.stateset.request('GET', `warranty_line_items/${warrantyLineId}`);
  }

  async create(warrantyLineData: any) {
    return this.stateset.request('POST', 'warranty_line_items', warrantyLineData);
  }

  async update(warrantyLineId: string, warrantyLineData: any) {
    return this.stateset.request('PUT', `warranty_line_items/${warrantyLineId}`, warrantyLineData);
  }

  async delete(warrantyLineId: string) {
        return this.stateset.request('DELETE', `warranty_line_items/${warrantyLineId}`);
    }

}

export default WarrantyLines;