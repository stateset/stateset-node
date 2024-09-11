"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Customers {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'customers');
    }
    async get(customerId) {
        return this.stateset.request('GET', `customers/${customerId}`);
    }
    async create(customerData) {
        return this.stateset.request('POST', 'customers', customerData);
    }
    async update(customerId, customerData) {
        return this.stateset.request('PUT', `customers/${customerId}`, customerData);
    }
    async delete(customerId) {
        return this.stateset.request('DELETE', `customers/${customerId}`);
    }
}
exports.default = Customers;
