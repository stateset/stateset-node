import { stateset } from '../../stateset-client';

class Returns {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'returns');
  }

  async get(returnId: string) {
    return this.stateset.request('GET', `returns/${returnId}`);
  }

  async create(returnData: any) {
    return this.stateset.request('POST', 'returns', returnData);
  }

  async update(returnId: string, returnData: any) {
    return this.stateset.request('PUT', `returns/${returnId}`, returnData);
  }

  async delete(returnId: string) {
    return this.stateset.request('DELETE', `returns/${returnId}`);
  }

}

export default Returns;