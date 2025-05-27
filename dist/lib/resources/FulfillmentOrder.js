"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FulfillmentOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_fulfillmentorders_by_pk) {
            throw new Error('Unexpected response format');
        }
        const fo = response.update_fulfillmentorders_by_pk;
        const base = {
            id: fo.id,
            object: 'fulfillmentorder',
            status: fo.status,
        };
        switch (fo.status) {
            case 'OPEN':
                return { ...base, status: 'OPEN', open: true };
            case 'ALLOCATED':
                return { ...base, status: 'ALLOCATED', allocated: true };
            case 'PICKED':
                return { ...base, status: 'PICKED', picked: true };
            case 'PACKED':
                return { ...base, status: 'PACKED', packed: true };
            case 'SHIPPED':
                return { ...base, status: 'SHIPPED', shipped: true };
            case 'CANCELLED':
                return { ...base, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected fulfillment order status: ${fo.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'fulfillmentorders');
        return response.map((fo) => this.handleCommandResponse({ update_fulfillmentorders_by_pk: fo }));
    }
    async get(id) {
        const response = await this.stateset.request('GET', `fulfillmentorders/${id}`);
        return this.handleCommandResponse({ update_fulfillmentorders_by_pk: response });
    }
    async create(data) {
        const response = await this.stateset.request('POST', 'fulfillmentorders', data);
        return this.handleCommandResponse(response);
    }
    async update(id, data) {
        const response = await this.stateset.request('PUT', `fulfillmentorders/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async delete(id) {
        await this.stateset.request('DELETE', `fulfillmentorders/${id}`);
    }
    async allocate(id) {
        const response = await this.stateset.request('POST', `fulfillmentorders/${id}/allocate`);
        return this.handleCommandResponse(response);
    }
    async pick(id) {
        const response = await this.stateset.request('POST', `fulfillmentorders/${id}/pick`);
        return this.handleCommandResponse(response);
    }
    async pack(id) {
        const response = await this.stateset.request('POST', `fulfillmentorders/${id}/pack`);
        return this.handleCommandResponse(response);
    }
    async ship(id) {
        const response = await this.stateset.request('POST', `fulfillmentorders/${id}/ship`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.stateset.request('POST', `fulfillmentorders/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
}
exports.default = FulfillmentOrders;
