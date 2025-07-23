"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASN = exports.ASNStateError = exports.ASNNotFoundError = exports.ASNError = exports.ASNStatus = void 0;
// Enums
var ASNStatus;
(function (ASNStatus) {
    ASNStatus["DRAFT"] = "DRAFT";
    ASNStatus["SUBMITTED"] = "SUBMITTED";
    ASNStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ASNStatus["DELIVERED"] = "DELIVERED";
    ASNStatus["CANCELLED"] = "CANCELLED";
})(ASNStatus || (exports.ASNStatus = ASNStatus = {}));
// Error Classes
class ASNError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.ASNError = ASNError;
class ASNNotFoundError extends ASNError {
    constructor(asnId) {
        super(`ASN with ID ${asnId} not found`, 'ASNNotFoundError');
    }
}
exports.ASNNotFoundError = ASNNotFoundError;
class ASNStateError extends ASNError {
    constructor(message) {
        super(message, 'ASNStateError');
    }
}
exports.ASNStateError = ASNStateError;
// Main ASN Class
class ASN {
    client;
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            const response = await this.client.request(method, path, data);
            return this.normalizeResponse(response);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ASNNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new ASNStateError(error.message);
            }
            throw error;
        }
    }
    normalizeResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        const asnData = response.update_asns_by_pk || response;
        if (!asnData?.id || !asnData?.status) {
            throw new Error('Unexpected response format');
        }
        return asnData;
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });
        const response = await this.request('GET', `asns?${queryParams.toString()}`);
        return response;
    }
    async get(asnId) {
        return this.request('GET', `asns/${asnId}`);
    }
    async create(asnData) {
        if (!asnData.items.length) {
            throw new ASNStateError('ASN must contain at least one item');
        }
        return this.request('POST', 'asns', asnData);
    }
    async update(asnId, asnData) {
        return this.request('PUT', `asns/${asnId}`, asnData);
    }
    async delete(asnId) {
        await this.request('DELETE', `asns/${asnId}`);
    }
    async submit(asnId) {
        return this.request('POST', `asns/${asnId}/submit`);
    }
    async markInTransit(asnId, transitDetails = {}) {
        return this.request('POST', `asns/${asnId}/in-transit`, transitDetails);
    }
    async markDelivered(asnId, deliveryDetails) {
        return this.request('POST', `asns/${asnId}/deliver`, deliveryDetails);
    }
    async cancel(asnId, cancellationDetails = {}) {
        return this.request('POST', `asns/${asnId}/cancel`, cancellationDetails);
    }
    async addItem(asnId, item) {
        if (item.quantity_shipped <= 0) {
            throw new ASNStateError('Quantity shipped must be greater than 0');
        }
        return this.request('POST', `asns/${asnId}/items`, item);
    }
    async removeItem(asnId, purchaseOrderItemId) {
        return this.request('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
    }
    async updateShippingInfo(asnId, shippingInfo) {
        return this.request('PUT', `asns/${asnId}/shipping-info`, shippingInfo);
    }
    async getTracking(asnId) {
        return this.request('GET', `asns/${asnId}/tracking`);
    }
}
exports.ASN = ASN;
exports.default = ASN;
//# sourceMappingURL=AdvancedShippingNotice.js.map