"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'purchaseorders');
    }
    async get(purchaseOrderId) {
        return this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
    }
    async create(purchaseOrderData) {
        return this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
    }
    async update(purchaseOrderId, purchaseOrderData) {
        return this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
    }
    async delete(purchaseOrderId) {
        return this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
    }
}
exports.default = PurchaseOrders;
