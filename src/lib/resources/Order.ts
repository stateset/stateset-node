import { stateset } from '../../stateset-client';

class Orders {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'orders');
  }

  async get(orderId: string) {
    return this.stateset.request('GET', `orders/${orderId}`);
  }

  async create(orderData: any) {
    return this.stateset.request('POST', 'orders', orderData);
  }

  async update(orderId: string, orderData: any) {
    return this.stateset.request('PUT', `orders/${orderId}`, orderData);
  }

  async delete(orderId: string) {
    return this.stateset.request('DELETE', `orders/${orderId}`);
  }

}

export default Orders;