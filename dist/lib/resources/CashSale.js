"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CashSales {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_cashsales_by_pk) {
            throw new Error('Unexpected response format');
        }
        const sale = response.update_cashsales_by_pk;
        const base = {
            id: sale.id,
            object: 'cashsale',
            status: sale.status,
        };
        switch (sale.status) {
            case 'PENDING':
                return { ...base, status: 'PENDING', pending: true };
            case 'COMPLETED':
                return { ...base, status: 'COMPLETED', completed: true };
            case 'CANCELLED':
                return { ...base, status: 'CANCELLED', cancelled: true };
            case 'REFUNDED':
                return { ...base, status: 'REFUNDED', refunded: true };
            default:
                throw new Error(`Unexpected cash sale status: ${sale.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'cashsales');
        return response.map((cs) => this.handleCommandResponse({ update_cashsales_by_pk: cs }));
    }
    async get(id) {
        const response = await this.stateset.request('GET', `cashsales/${id}`);
        return this.handleCommandResponse({ update_cashsales_by_pk: response });
    }
    async create(data) {
        const response = await this.stateset.request('POST', 'cashsales', data);
        return this.handleCommandResponse(response);
    }
    async update(id, data) {
        const response = await this.stateset.request('PUT', `cashsales/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async delete(id) {
        await this.stateset.request('DELETE', `cashsales/${id}`);
    }
    async complete(id) {
        const response = await this.stateset.request('POST', `cashsales/${id}/complete`);
        return this.handleCommandResponse(response);
    }
    async refund(id) {
        const response = await this.stateset.request('POST', `cashsales/${id}/refund`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.stateset.request('POST', `cashsales/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
}
exports.default = CashSales;
