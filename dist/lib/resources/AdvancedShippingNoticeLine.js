"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASNLines = exports.ASNLineValidationError = exports.ASNLineNotFoundError = exports.ASNLineError = exports.LineItemStatus = exports.WeightUnit = void 0;
// Enums
var WeightUnit;
(function (WeightUnit) {
    WeightUnit["LB"] = "LB";
    WeightUnit["KG"] = "KG";
})(WeightUnit = exports.WeightUnit || (exports.WeightUnit = {}));
var LineItemStatus;
(function (LineItemStatus) {
    LineItemStatus["PENDING"] = "PENDING";
    LineItemStatus["IN_TRANSIT"] = "IN_TRANSIT";
    LineItemStatus["DELIVERED"] = "DELIVERED";
})(LineItemStatus = exports.LineItemStatus || (exports.LineItemStatus = {}));
// Error Classes
class ASNLineError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.ASNLineError = ASNLineError;
class ASNLineNotFoundError extends ASNLineError {
    constructor(lineItemId) {
        super(`ASN Line Item with ID ${lineItemId} not found`, 'ASNLineNotFoundError');
    }
}
exports.ASNLineNotFoundError = ASNLineNotFoundError;
class ASNLineValidationError extends ASNLineError {
    constructor(message) {
        super(message, 'ASNLineValidationError');
    }
}
exports.ASNLineValidationError = ASNLineValidationError;
// Main ASNLines Class
class ASNLines {
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            return await this.client.request(method, path, data);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ASNLineNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new ASNLineValidationError(error.message);
            }
            throw error;
        }
    }
    validateLineItem(data) {
        if (data.quantity_shipped !== undefined && data.quantity_shipped <= 0) {
            throw new ASNLineValidationError('Quantity shipped must be greater than 0');
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });
        const endpoint = params.asn_id
            ? `asns/${params.asn_id}/line_items`
            : 'asn_line_items';
        return this.request('GET', `${endpoint}?${queryParams.toString()}`);
    }
    async get(lineItemId) {
        return this.request('GET', `asn_line_items/${lineItemId}`);
    }
    async create(lineItemData) {
        this.validateLineItem(lineItemData);
        return this.request('POST', 'asn_line_items', {
            ...lineItemData,
            status: lineItemData.status || LineItemStatus.PENDING
        });
    }
    async update(lineItemId, lineItemData) {
        this.validateLineItem(lineItemData);
        return this.request('PUT', `asn_line_items/${lineItemId}`, lineItemData);
    }
    async delete(lineItemId) {
        await this.request('DELETE', `asn_line_items/${lineItemId}`);
    }
    async bulkCreate(asnId, lineItems) {
        if (!lineItems.length) {
            throw new ASNLineValidationError('At least one line item is required for bulk create');
        }
        lineItems.forEach(this.validateLineItem);
        return this.request('POST', `asns/${asnId}/line_items/bulk`, { line_items: lineItems.map(item => ({
                ...item,
                status: item.status || LineItemStatus.PENDING
            })) });
    }
    async updateTrackingInfo(lineItemId, trackingInfo) {
        return this.request('PUT', `asn_line_items/${lineItemId}/tracking`, trackingInfo);
    }
    async updateStatus(lineItemId, status, statusDetails = {}) {
        return this.request('PUT', `asn_line_items/${lineItemId}/status`, { status, ...statusDetails });
    }
    async getTrackingHistory(lineItemId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.from_date)
            queryParams.append('from_date', params.from_date.toISOString());
        if (params.to_date)
            queryParams.append('to_date', params.to_date.toISOString());
        return this.request('GET', `asn_line_items/${lineItemId}/tracking-history?${queryParams.toString()}`);
    }
}
exports.ASNLines = ASNLines;
exports.default = ASNLines;
