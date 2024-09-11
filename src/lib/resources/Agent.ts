import { stateset } from '../../stateset-client';

class Agents {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'agents');
  }

  async get(agentId: string) {
    return this.stateset.request('GET', `agents/${agentId}`);
  }

  async create(agentData: any) {
    return this.stateset.request('POST', 'agents', agentData);
  }

  async update(agentId: string, agentData: any) {
    return this.stateset.request('PUT', `agents/${agentId}`, agentData);
  }

  async delete(agentId: string) {
        return this.stateset.request('DELETE', `agents/${agentId}`);
  }

}

export default Agents;