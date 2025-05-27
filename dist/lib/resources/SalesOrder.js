"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SalesOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_salesorders_by_pk) {
            throw new Error('Unexpected response format');
        }
        const salesOrder = response.update_salesorders_by_pk;
        const base = {
            id: salesOrder.id,
            object: 'salesorder',
            status: salesOrder.status,
        };
        switch (salesOrder.status) {
            case 'DRAFT':
                return { ...base, status: 'DRAFT', draft: true };
            case 'SUBMITTED':
                return { ...base, status: 'SUBMITTED', submitted: true };
            case 'FULFILLED':
                return { ...base, status: 'FULFILLED', fulfilled: true };
            case 'INVOICED':
                return { ...base, status: 'INVOICED', invoiced: true };
            case 'PAID':
                return { ...base, status: 'PAID', paid: true };
            case 'CANCELLED':
                return { ...base, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected sales order status: ${salesOrder.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'salesorders');
        return response.map((so) => this.handleCommandResponse({ update_salesorders_by_pk: so }));
    }
    async get(id) {
        const response = await this.stateset.request('GET', `salesorders/${id}`);
        return this.handleCommandResponse({ update_salesorders_by_pk: response });
    }
    async create(data) {
        const response = await this.stateset.request('POST', 'salesorders', data);
        return this.handleCommandResponse(response);
    }
    async update(id, data) {
        const response = await this.stateset.request('PUT', `salesorders/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async delete(id) {
        await this.stateset.request('DELETE', `salesorders/${id}`);
    }
    async submit(id) {
        const response = await this.stateset.request('POST', `salesorders/${id}/submit`);
        return this.handleCommandResponse(response);
    }
    async fulfill(id) {
        const response = await this.stateset.request('POST', `salesorders/${id}/fulfill`);
        return this.handleCommandResponse(response);
    }
    async invoice(id) {
        const response = await this.stateset.request('POST', `salesorders/${id}/invoice`);
        return this.handleCommandResponse(response);
    }
    async pay(id) {
        const response = await this.stateset.request('POST', `salesorders/${id}/pay`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.stateset.request('POST', `salesorders/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
}
exports.default = SalesOrders;
