import { stateset } from '../../stateset-client';

class ReturnLines {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'return_line_items');
  }

  async get(returnLineId: string) {
    return this.stateset.request('GET', `return_line_items/${returnLineId}`);
  }

  async create(returnLineData: any) {
    return this.stateset.request('POST', 'return_line_items', returnLineData);
  }

  async update(returnLineId: string, returnLineData: any) {
    return this.stateset.request('PUT', `return_line_items/${returnLineId}`, returnLineData);
  }

  async delete(returnLineId: string) {
        return this.stateset.request('DELETE', `return_line_items/${returnLineId}`);
    }

}

export default ReturnLines;