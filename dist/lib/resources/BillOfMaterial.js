"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BillOfMaterials {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'billofmaterials');
    }
    async get(billOfMaterialId) {
        return this.stateset.request('GET', `billofmaterials/${billOfMaterialId}`);
    }
    async create(billOfMaterialData) {
        return this.stateset.request('POST', 'billofmaterials', billOfMaterialData);
    }
    async update(billOfMaterialId, billOfMaterialData) {
        return this.stateset.request('PUT', `billofmaterials/${billOfMaterialId}`, billOfMaterialData);
    }
    async delete(billOfMaterialId) {
        return this.stateset.request('DELETE', `billofmaterials/${billOfMaterialId}`);
    }
}
exports.default = BillOfMaterials;
