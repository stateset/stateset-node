"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Rules {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'rules');
    }
    async get(ruleId) {
        return this.stateset.request('GET', `rules/${ruleId}`);
    }
    async create(ruleData) {
        return this.stateset.request('POST', 'rules', ruleData);
    }
    async update(ruleId, ruleData) {
        return this.stateset.request('PUT', `rules/${ruleId}`, ruleData);
    }
    async delete(ruleId) {
        return this.stateset.request('DELETE', `rules/${ruleId}`);
    }
}
exports.default = Rules;
