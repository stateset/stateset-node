"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'log');
    }
    async get(id) {
        return this.stateset.request('GET', `log/${id}`);
    }
    async create(logData) {
        return this.stateset.request('POST', 'log', logData);
    }
    async update(id, logData) {
        return this.stateset.request('PUT', `log/${id}`, logData);
    }
    async delete(id) {
        return this.stateset.request('DELETE', `log/${id}`);
    }
}
exports.default = Log;
