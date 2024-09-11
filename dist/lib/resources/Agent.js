"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Agents {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'agents');
    }
    async get(agentId) {
        return this.stateset.request('GET', `agents/${agentId}`);
    }
    async create(agentData) {
        return this.stateset.request('POST', 'agents', agentData);
    }
    async update(agentId, agentData) {
        return this.stateset.request('PUT', `agents/${agentId}`, agentData);
    }
    async delete(agentId) {
        return this.stateset.request('DELETE', `agents/${agentId}`);
    }
}
exports.default = Agents;
