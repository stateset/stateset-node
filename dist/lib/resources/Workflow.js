"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Workflows {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'workflows');
    }
    async get(workflowId) {
        return this.stateset.request('GET', `workflows/${workflowId}`);
    }
    async create(workflowData) {
        return this.stateset.request('POST', 'workflows', workflowData);
    }
    async update(workflowId, workflowData) {
        return this.stateset.request('PUT', `workflows/${workflowId}`, workflowData);
    }
    async delete(workflowId) {
        return this.stateset.request('DELETE', `workflows/${workflowId}`);
    }
}
exports.default = Workflows;
