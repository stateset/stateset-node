"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Warranty {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_returns_by_pk) {
            throw new Error('Unexpected response format');
        }
        const warrantyData = response.update_returns_by_pk;
        const baseResponse = {
            id: warrantyData.id,
            object: 'warranty',
            status: warrantyData.status,
        };
        switch (warrantyData.status) {
            case 'APPROVED':
                return { ...baseResponse, status: 'APPROVED', approved: true };
            case 'REJECTED':
                return { ...baseResponse, status: 'REJECTED', rejected: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            case 'CLOSED':
                return { ...baseResponse, status: 'CLOSED', closed: true };
            case 'REOPENED':
                return { ...baseResponse, status: 'REOPENED', reopened: true };
            default:
                throw new Error(`Unexpected warranty status: ${warrantyData.status}`);
        }
    }
    async list() {
        return this.stateset.request('GET', 'warranties');
    }
    async get(warrantyId) {
        return this.stateset.request('GET', `warranties/${warrantyId}`);
    }
    async create(warrantyData) {
        return this.stateset.request('POST', 'warranties', warrantyData);
    }
    async approve(warrantyId) {
        const response = await this.stateset.request('POST', `warranties/approve/${warrantyId}`);
        return this.handleCommandResponse(response);
    }
    async reject(warrantyId) {
        const response = await this.stateset.request('POST', `warranties/reject/${warrantyId}`);
        return this.handleCommandResponse(response);
    }
    async cancel(warrantyId) {
        const response = await this.stateset.request('POST', `warranties/cancel/${warrantyId}`);
        return this.handleCommandResponse(response);
    }
    async close(warrantyId) {
        const response = await this.stateset.request('POST', `warranties/close/${warrantyId}`);
        return this.handleCommandResponse(response);
    }
    async reopen(warrantyId) {
        const response = await this.stateset.request('POST', `warranties/reopen/${warrantyId}`);
        return this.handleCommandResponse(response);
    }
    async update(warrantyId, warrantyData) {
        return this.stateset.request('PUT', `warranties/${warrantyId}`, warrantyData);
    }
    async delete(warrantyId) {
        return this.stateset.request('DELETE', `warranties/${warrantyId}`);
    }
}
exports.default = Warranty;
