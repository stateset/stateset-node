"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Orders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'orders');
    }
    async get(orderId) {
        return this.stateset.request('GET', `orders/${orderId}`);
    }
    async create(orderData) {
        return this.stateset.request('POST', 'orders', orderData);
    }
    async update(orderId, orderData) {
        return this.stateset.request('PUT', `orders/${orderId}`, orderData);
    }
    async delete(orderId) {
        return this.stateset.request('DELETE', `orders/${orderId}`);
    }
}
exports.default = Orders;
