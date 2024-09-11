import { stateset } from '../../stateset-client';

class Customers {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'customers');
  }

  async get(customerId: string) {
    return this.stateset.request('GET', `customers/${customerId}`);
  }

  async create(customerData: any) {
    return this.stateset.request('POST', 'customers', customerData);
  }

  async update(customerId: string, customerData: any) {
    return this.stateset.request('PUT', `customers/${customerId}`, customerData);
  }

  async delete(customerId: string) {
    return this.stateset.request('DELETE', `customers/${customerId}`);
  }

}

export default Customers;