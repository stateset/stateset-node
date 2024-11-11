import { stateset } from '../../stateset-client';

class Log {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'log');
  }

  async get(id: string) {
    return this.stateset.request('GET', `log/${id}`);
  }

  async create(logData: any) {
    return this.stateset.request('POST', 'log', logData);
  }

  async update(id: string, logData: any) {
    return this.stateset.request('PUT', `log/${id}`, logData);
  }

  async delete(id: string) {
    return this.stateset.request('DELETE', `log/${id}`);
  }

}

export default Log;
