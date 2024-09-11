import { stateset } from '../../stateset-client';

class OrderLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'order_line_items');
  }

  async get(orderLineId: string) {
    return this.stateset.request('GET', `order_line_items/${orderLineId}`);
  }

  async create(orderLineData: any) {
    return this.stateset.request('POST', 'order_line_items', orderLineData);
  }

  async update(orderLineId: string, orderLineData: any) {
    return this.stateset.request('PUT', `order_line_items/${orderLineId}`, orderLineData);
  }

  async delete(orderLineId: string) {
        return this.stateset.request('DELETE', `order_line_items/${orderLineId}`);
    }

}

export default OrderLines;