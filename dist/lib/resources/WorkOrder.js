"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Workorders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'workorders');
    }
    async get(workorderId) {
        return this.stateset.request('GET', `workorders/${workorderId}`);
    }
    async create(workorderData) {
        return this.stateset.request('POST', 'workorders', workorderData);
    }
    async update(workorderId, workorderData) {
        return this.stateset.request('PUT', `workorders/${workorderId}`, workorderData);
    }
    async delete(workorderId) {
        return this.stateset.request('DELETE', `workorders/${workorderId}`);
    }
}
exports.default = Workorders;
