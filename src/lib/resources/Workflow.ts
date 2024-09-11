import { stateset } from '../../stateset-client';

class Workflows {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'workflows');
  }

  async get(workflowId: string) {
    return this.stateset.request('GET', `workflows/${workflowId}`);
  }

  async create(workflowData: any) {
    return this.stateset.request('POST', 'workflows', workflowData);
  }

  async update(workflowId: string, workflowData: any) {
    return this.stateset.request('PUT', `workflows/${workflowId}`, workflowData);
  }

  async delete(workflowId: string) {
    return this.stateset.request('DELETE', `workflows/${workflowId}`);
  }

}

export default Workflows;