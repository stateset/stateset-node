"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CycleCounts {
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_cycle_counts_by_pk) {
            throw new Error('Unexpected response format');
        }
        const cycleCountData = response.update_cycle_counts_by_pk;
        const baseResponse = {
            id: cycleCountData.id,
            object: 'cycle-count',
            status: cycleCountData.status,
        };
        switch (cycleCountData.status) {
            case 'PENDING':
                return { ...baseResponse, status: 'PENDING', pending: true };
            case 'IN_PROGRESS':
                return { ...baseResponse, status: 'IN_PROGRESS', inProgress: true };
            case 'COMPLETED':
                return { ...baseResponse, status: 'COMPLETED', completed: true };
            case 'RECONCILED':
                return { ...baseResponse, status: 'RECONCILED', reconciled: true };
            default:
                throw new Error(`Unexpected cycle count status: ${cycleCountData.status}`);
        }
    }
    async create(data) {
        const response = await this.client.request('POST', 'cycle-counts', data);
        return this.handleCommandResponse(response);
    }
    async get(id) {
        const response = await this.client.request('GET', `cycle-counts/${id}`);
        return this.handleCommandResponse({ update_cycle_counts_by_pk: response });
    }
    async update(id, data) {
        const response = await this.client.request('PUT', `cycle-counts/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async list(params) {
        const response = await this.client.request('GET', 'cycle-counts', params);
        return response.map((cycleCount) => this.handleCommandResponse({ update_cycle_counts_by_pk: cycleCount }));
    }
    async delete(id) {
        await this.client.request('DELETE', `cycle-counts/${id}`);
    }
    async complete(id, data) {
        const response = await this.client.request('POST', `cycle-counts/${id}/complete`, data);
        return this.handleCommandResponse(response);
    }
    async reconcile(id) {
        const response = await this.client.request('POST', `cycle-counts/${id}/reconcile`);
        return this.handleCommandResponse(response);
    }
    async start(id) {
        const response = await this.client.request('POST', `cycle-counts/${id}/start`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.client.request('POST', `cycle-counts/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
    async getDiscrepancies(id) {
        return this.client.request('GET', `cycle-counts/${id}/discrepancies`);
    }
}
exports.default = CycleCounts;
