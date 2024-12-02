import { stateset } from '../../stateset-client';

class Log {
  constructor(private stateset: stateset) {}

  /**
   * List logs
   * @returns Array of LogResponse objects
   */
  async list() {
    return this.stateset.request('GET', 'log');
  }

  /**
   * Get a log by ID
   * @param id - Log ID
   * @returns LogResponse object
   */
  async get(id: string) {
    return this.stateset.request('GET', `log/${id}`);
  }

  /**
   * Create a new log
   * @param logData - LogData object
   * @returns LogResponse object
   */
  async create(logData: any) {
    return this.stateset.request('POST', 'log', logData);
  }

  /**
   * Update a log
   * @param id - Log ID
   * @param logData - Partial<LogData> object
   * @returns LogResponse object
   */
  async update(id: string, logData: any) {
    return this.stateset.request('PUT', `log/${id}`, logData);
  }

  /**
   * Delete a log
   * @param id - Log ID
   */
  async delete(id: string) {
    return this.stateset.request('DELETE', `log/${id}`);
  }

}

export default Log;
