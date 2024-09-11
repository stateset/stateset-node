import { stateset } from '../../stateset-client';

class ManufactureOrderLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'manufacture_order_line_items');
  }

  async get(manufactureOrderLineId: string) {
    return this.stateset.request('GET', `manufacture_order_line_items/${manufactureOrderLineId}`);
  }

  async create(manufactureOrderLineData: any) {
    return this.stateset.request('POST', 'manufacture_order_line_items', manufactureOrderLineData);
  }

  async update(manufactureOrderLineId: string, manufactureOrderLineData: any) {
    return this.stateset.request('PUT', `manufacture_order_line_items/${manufactureOrderLineId}`, manufactureOrderLineData);
  }

  async delete(manufactureOrderLineId: string) {
        return this.stateset.request('DELETE', `manufacture_order_line_items/${manufactureOrderLineId}`);
    }

}

export default ManufactureOrderLines;