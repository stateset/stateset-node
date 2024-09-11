import { stateset } from '../../stateset-client';

class Rules {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'rules');
  }

  async get(ruleId: string) {
    return this.stateset.request('GET', `rules/${ruleId}`);
  }

  async create(ruleData: any) {
    return this.stateset.request('POST', 'rules', ruleData);
  }

  async update(ruleId: string, ruleData: any) {
    return this.stateset.request('PUT', `rules/${ruleId}`, ruleData);
  }

  async delete(ruleId: string) {
    return this.stateset.request('DELETE', `rules/${ruleId}`);
  }

}

export default Rules;