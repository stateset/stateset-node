"use strict";
// lib/resources/WasteAndScrap.ts
Object.defineProperty(exports, "__esModule", { value: true });
class WasteAndScrap {
    client;
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_waste_and_scrap_by_pk) {
            throw new Error('Unexpected response format');
        }
        const wasteAndScrapData = response.update_waste_and_scrap_by_pk;
        const baseResponse = {
            id: wasteAndScrapData.id,
            object: 'waste-and-scrap',
            status: wasteAndScrapData.status,
        };
        switch (wasteAndScrapData.status) {
            case 'PENDING':
                return { ...baseResponse, status: 'PENDING', pending: true };
            case 'PROCESSED':
                return { ...baseResponse, status: 'PROCESSED', processed: true };
            case 'DISPOSED':
                return { ...baseResponse, status: 'DISPOSED', disposed: true };
            case 'RECYCLED':
                return { ...baseResponse, status: 'RECYCLED', recycled: true };
            default:
                throw new Error(`Unexpected waste and scrap status: ${wasteAndScrapData.status}`);
        }
    }
    /**
     * @param data - WasteAndScrapData object
     * @returns WasteAndScrapResponse object
     */
    async create(data) {
        const response = await this.client.request('POST', 'waste-and-scrap', data);
        return this.handleCommandResponse(response);
    }
    /**
     * @param id - WasteAndScrap ID
     * @returns WasteAndScrapResponse object
     */
    async get(id) {
        const response = await this.client.request('GET', `waste-and-scrap/${id}`);
        return this.handleCommandResponse({ update_waste_and_scrap_by_pk: response });
    }
    /**
     * @param id - WasteAndScrap ID
     * @param data - Partial<WasteAndScrapData> object
     * @returns WasteAndScrapResponse object
     */
    async update(id, data) {
        const response = await this.client.request('PUT', `waste-and-scrap/${id}`, data);
        return this.handleCommandResponse(response);
    }
    /**
     * @param params - Filtering parameters
     * @returns Array of WasteAndScrapResponse objects
     */
    async list(params) {
        const response = await this.client.request('GET', 'waste-and-scrap', params);
        return response.map((item) => this.handleCommandResponse({ update_waste_and_scrap_by_pk: item }));
    }
    /**
     * @param id - WasteAndScrap ID
     */
    async delete(id) {
        await this.client.request('DELETE', `waste-and-scrap/${id}`);
    }
    /**
     * @param params - Filtering parameters
     * @returns Array of WasteAndScrapResponse objects
     */
    async generateReport(params) {
        return this.client.request('GET', 'waste-and-scrap/report', params);
    }
    /**
     * @param id - WasteAndScrap ID
     * @param data - DisposalData object
     * @returns DisposedWasteAndScrapResponse object
     */
    async recordDisposal(id, data) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/dispose`, data);
        return this.handleCommandResponse(response);
    }
    /**
     * @param id - WasteAndScrap ID
     * @returns ProcessedWasteAndScrapResponse object
     */
    async markAsProcessed(id) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/process`);
        return this.handleCommandResponse(response);
    }
    /**
     * @param id - WasteAndScrap ID
     * @returns RecycledWasteAndScrapResponse object
     */
    async markAsRecycled(id) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/recycle`);
        return this.handleCommandResponse(response);
    }
    /**
     * @param id - WasteAndScrap ID
     * @returns Array of DisposalData objects
     */
    async getDisposalHistory(id) {
        return this.client.request('GET', `waste-and-scrap/${id}/disposal-history`);
    }
}
exports.default = WasteAndScrap;
//# sourceMappingURL=WasteAndScrap.js.map