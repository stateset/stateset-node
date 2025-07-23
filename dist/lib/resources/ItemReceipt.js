"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ItemReceipts {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_itemreceipts_by_pk) {
            throw new Error('Unexpected response format');
        }
        const rec = response.update_itemreceipts_by_pk;
        const base = {
            id: rec.id,
            object: 'itemreceipt',
            status: rec.status,
        };
        switch (rec.status) {
            case 'PENDING':
                return { ...base, status: 'PENDING', pending: true };
            case 'RECEIVED':
                return { ...base, status: 'RECEIVED', received: true };
            case 'PARTIAL':
                return { ...base, status: 'PARTIAL', partial: true };
            case 'CANCELLED':
                return { ...base, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected item receipt status: ${rec.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'itemreceipts');
        return response.map((r) => this.handleCommandResponse({ update_itemreceipts_by_pk: r }));
    }
    async get(id) {
        const response = await this.stateset.request('GET', `itemreceipts/${id}`);
        return this.handleCommandResponse({ update_itemreceipts_by_pk: response });
    }
    async create(data) {
        const response = await this.stateset.request('POST', 'itemreceipts', data);
        return this.handleCommandResponse(response);
    }
    async update(id, data) {
        const response = await this.stateset.request('PUT', `itemreceipts/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async delete(id) {
        await this.stateset.request('DELETE', `itemreceipts/${id}`);
    }
    async receive(id) {
        const response = await this.stateset.request('POST', `itemreceipts/${id}/receive`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.stateset.request('POST', `itemreceipts/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
}
exports.default = ItemReceipts;
//# sourceMappingURL=ItemReceipt.js.map