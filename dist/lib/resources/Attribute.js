"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Attributes {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'attributes');
    }
    async get(attributeId) {
        return this.stateset.request('GET', `attributes/${attributeId}`);
    }
    async create(attributeData) {
        return this.stateset.request('POST', 'attributes', attributeData);
    }
    async update(attributeId, attributeData) {
        return this.stateset.request('PUT', `attributes/${attributeId}`, attributeData);
    }
    async delete(attributeId) {
        return this.stateset.request('DELETE', `attributes/${attributeId}`);
    }
}
exports.default = Attributes;
