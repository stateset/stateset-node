"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shipments = exports.CarrierApiError = exports.ShipmentValidationError = exports.ShipmentNotFoundError = exports.ShipmentError = exports.PackageType = exports.ServiceLevel = exports.ShippingCarrier = exports.ShipmentStatus = void 0;
// Enums with improved consistency
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "pending";
    ShipmentStatus["LABEL_CREATED"] = "label_created";
    ShipmentStatus["PICKING"] = "picking";
    ShipmentStatus["PICKED"] = "picked";
    ShipmentStatus["PACKING"] = "packing";
    ShipmentStatus["PACKED"] = "packed";
    ShipmentStatus["SHIPPED"] = "shipped";
    ShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    ShipmentStatus["ATTEMPTED_DELIVERY"] = "attempted_delivery";
    ShipmentStatus["DELIVERED"] = "delivered";
    ShipmentStatus["EXCEPTION"] = "exception";
    ShipmentStatus["CANCELLED"] = "cancelled";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var ShippingCarrier;
(function (ShippingCarrier) {
    ShippingCarrier["FEDEX"] = "FEDEX";
    ShippingCarrier["UPS"] = "UPS";
    ShippingCarrier["USPS"] = "USPS";
    ShippingCarrier["DHL"] = "DHL";
    ShippingCarrier["ONTRAC"] = "ONTRAC";
})(ShippingCarrier || (exports.ShippingCarrier = ShippingCarrier = {}));
var ServiceLevel;
(function (ServiceLevel) {
    ServiceLevel["GROUND"] = "GROUND";
    ServiceLevel["TWO_DAY"] = "TWO_DAY";
    ServiceLevel["OVERNIGHT"] = "OVERNIGHT";
    ServiceLevel["INTERNATIONAL"] = "INTERNATIONAL";
    ServiceLevel["ECONOMY"] = "ECONOMY";
})(ServiceLevel || (exports.ServiceLevel = ServiceLevel = {}));
var PackageType;
(function (PackageType) {
    PackageType["CUSTOM"] = "CUSTOM";
    PackageType["ENVELOPE"] = "ENVELOPE";
    PackageType["PAK"] = "PAK";
    PackageType["TUBE"] = "TUBE";
    PackageType["BOX_SMALL"] = "BOX_SMALL";
    PackageType["BOX_MEDIUM"] = "BOX_MEDIUM";
    PackageType["BOX_LARGE"] = "BOX_LARGE";
    PackageType["PALLET"] = "PALLET";
})(PackageType || (exports.PackageType = PackageType = {}));
// Error Classes with additional context
class ShipmentError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.ShipmentError = ShipmentError;
class ShipmentNotFoundError extends ShipmentError {
    constructor(shipmentId) {
        super(`Shipment with ID ${shipmentId} not found`, { shipmentId });
    }
}
exports.ShipmentNotFoundError = ShipmentNotFoundError;
class ShipmentValidationError extends ShipmentError {
    validationErrors;
    constructor(message, validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }
}
exports.ShipmentValidationError = ShipmentValidationError;
class CarrierApiError extends ShipmentError {
    carrier;
    code;
    constructor(message, carrier, code) {
        super(message, { carrier, code });
        this.carrier = carrier;
        this.code = code;
    }
}
exports.CarrierApiError = CarrierApiError;
// Main Shipments Class with improved error handling and validation
class Shipments {
    client;
    constructor(client) {
        this.client = client;
    }
    validateShipmentData(data) {
        if (!data.order_id)
            throw new ShipmentValidationError('Order ID is required');
        if (!data.customer_id)
            throw new ShipmentValidationError('Customer ID is required');
        if (!data.shipping_address)
            throw new ShipmentValidationError('Shipping address is required');
    }
    async list(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.carrier && { carrier: params.carrier }),
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.customer_id && { customer_id: params.customer_id }),
            ...(params.date_range?.from && { date_from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { date_to: params.date_range.to.toISOString() }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        const response = await this.client.request('GET', `shipments?${query}`);
        return response;
    }
    async getRates(data) {
        this.validateShipmentData(data);
        const response = await this.client.request('POST', 'shipments/rates', data);
        return response.rates;
    }
    async create(data) {
        this.validateShipmentData(data);
        try {
            const response = await this.client.request('POST', 'shipments', data);
            return response.shipment;
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    async update(shipmentId, data) {
        try {
            const response = await this.client.request('PUT', `shipments/${shipmentId}`, data);
            return response.shipment;
        }
        catch (error) {
            throw this.handleApiError(error, shipmentId);
        }
    }
    async addPackage(shipmentId, packageData) {
        const response = await this.client.request('POST', `shipments/${shipmentId}/packages`, packageData);
        return response.shipment;
    }
    async generateReturnLabel(shipmentId, options = {}) {
        const response = await this.client.request('POST', `shipments/${shipmentId}/return-label`, options);
        return response.label;
    }
    async generateLabel(shipmentId, options = {}) {
        const response = await this.client.request('POST', `shipments/${shipmentId}/label`, options);
        return response.label;
    }
    async getTrackingDetails(shipmentId, options = {}) {
        const query = new URLSearchParams({
            ...(options.include_proof_of_delivery && { include_pod: 'true' }),
            ...(options.include_full_history && { full_history: 'true' }),
        });
        const response = await this.client.request('GET', `shipments/${shipmentId}/tracking?${query}`);
        return response.tracking;
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.date_range?.start && { start_date: params.date_range.start.toISOString() }),
            ...(params.date_range?.end && { end_date: params.date_range.end.toISOString() }),
            ...(params.carrier && { carrier: params.carrier }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.group_by && { group_by: params.group_by }),
        });
        const response = await this.client.request('GET', `shipments/metrics?${query}`);
        return response.metrics;
    }
    handleApiError(error, shipmentId) {
        if (error.status === 404)
            throw new ShipmentNotFoundError(shipmentId || 'unknown');
        if (error.status === 400)
            throw new ShipmentValidationError(error.message, error.errors);
        if (error.carrier_error)
            throw new CarrierApiError(error.message, error.carrier, error.code);
        throw new ShipmentError('Unexpected error occurred', { originalError: error });
    }
}
exports.Shipments = Shipments;
exports.default = Shipments;
//# sourceMappingURL=Shipment.js.map