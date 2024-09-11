"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Returns {
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
        const returnData = response.update_returns_by_pk;
        const baseResponse = {
            id: returnData.id,
            object: 'return',
            status: returnData.status,
        };
        switch (returnData.status) {
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
                throw new Error(`Unexpected return status: ${returnData.status}`);
        }
    }
    async list() {
        return this.stateset.request('GET', 'returns');
    }
    async get(returnId) {
        return this.stateset.request('GET', `returns/${returnId}`);
    }
    async create(returnData) {
        return this.stateset.request('POST', 'returns', returnData);
    }
    async approve(returnId) {
        const response = await this.stateset.request('POST', `returns/approve/${returnId}`);
        return this.handleCommandResponse(response);
    }
    async reject(returnId) {
        const response = await this.stateset.request('POST', `returns/reject/${returnId}`);
        return this.handleCommandResponse(response);
    }
    async cancel(returnId) {
        const response = await this.stateset.request('POST', `returns/cancel/${returnId}`);
        return this.handleCommandResponse(response);
    }
    async close(returnId) {
        const response = await this.stateset.request('POST', `returns/close/${returnId}`);
        return this.handleCommandResponse(response);
    }
    async reopen(returnId) {
        const response = await this.stateset.request('POST', `returns/reopen/${returnId}`);
        return this.handleCommandResponse(response);
    }
    async update(returnId, returnData) {
        return this.stateset.request('PUT', `returns/${returnId}`, returnData);
    }
    async delete(returnId) {
        return this.stateset.request('DELETE', `returns/${returnId}`);
    }
}
exports.default = Returns;
