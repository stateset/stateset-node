import { stateset } from '../../stateset-client';

class Workorders {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'workorders');
  }

  async get(workorderId: string) {
    return this.stateset.request('GET', `workorders/${workorderId}`);
  }

  async create(workorderData: any) {
    return this.stateset.request('POST', 'workorders', workorderData);
  }

  async update(workorderId: string, workorderData: any) {
    return this.stateset.request('PUT', `workorders/${workorderId}`, workorderData);
  }

  async delete(workorderId: string) {
        return this.stateset.request('DELETE', `workorders/${workorderId}`);
  }

}

export default Workorders;