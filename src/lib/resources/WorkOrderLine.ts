import { stateset } from '../../stateset-client';

class WorkOrderLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'work_order_line_items');
  }

  async get(workOrderLineId: string) {
    return this.stateset.request('GET', `work_order_line_items/${workOrderLineId}`);
  }

  async create(workOrderLineData: any) {
    return this.stateset.request('POST', 'work_order_line_items', workOrderLineData);
  }

  async update(workOrderLineId: string, workOrderLineData: any) {
    return this.stateset.request('PUT', `work_order_line_items/${workOrderLineId}`, workOrderLineData);
  }

  async delete(workOrderLineId: string) {
        return this.stateset.request('DELETE', `work_order_line_items/${workOrderLineId}`);
    }

}

export default WorkOrderLines;