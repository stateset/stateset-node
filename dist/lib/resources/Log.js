"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
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
    async get(id) {
        return this.stateset.request('GET', `log/${id}`);
    }
    /**
     * Create a new log
     * @param logData - LogData object
     * @returns LogResponse object
     */
    async create(logData) {
        return this.stateset.request('POST', 'log', logData);
    }
    /**
     * Update a log
     * @param id - Log ID
     * @param logData - Partial<LogData> object
     * @returns LogResponse object
     */
    async update(id, logData) {
        return this.stateset.request('PUT', `log/${id}`, logData);
    }
    /**
     * Delete a log
     * @param id - Log ID
     */
    async delete(id) {
        return this.stateset.request('DELETE', `log/${id}`);
    }
}
exports.default = Log;
//# sourceMappingURL=Log.js.map