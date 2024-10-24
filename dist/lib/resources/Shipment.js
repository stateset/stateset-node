"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrierApiError = exports.ShipmentValidationError = exports.ShipmentNotFoundError = exports.PackageType = exports.ServiceLevel = exports.ShippingCarrier = exports.ShipmentStatus = void 0;
// Enums for shipment management
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "PENDING";
    ShipmentStatus["LABEL_CREATED"] = "LABEL_CREATED";
    ShipmentStatus["PICKING"] = "PICKING";
    ShipmentStatus["PICKED"] = "PICKED";
    ShipmentStatus["PACKING"] = "PACKING";
    ShipmentStatus["PACKED"] = "PACKED";
    ShipmentStatus["SHIPPED"] = "SHIPPED";
    ShipmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    ShipmentStatus["ATTEMPTED_DELIVERY"] = "ATTEMPTED_DELIVERY";
    ShipmentStatus["DELIVERED"] = "DELIVERED";
    ShipmentStatus["EXCEPTION"] = "EXCEPTION";
    ShipmentStatus["CANCELLED"] = "CANCELLED";
})(ShipmentStatus = exports.ShipmentStatus || (exports.ShipmentStatus = {}));
var ShippingCarrier;
(function (ShippingCarrier) {
    ShippingCarrier["FEDEX"] = "fedex";
    ShippingCarrier["UPS"] = "ups";
    ShippingCarrier["USPS"] = "usps";
    ShippingCarrier["DHL"] = "dhl";
    ShippingCarrier["ONTRAC"] = "ontrac";
})(ShippingCarrier = exports.ShippingCarrier || (exports.ShippingCarrier = {}));
var ServiceLevel;
(function (ServiceLevel) {
    ServiceLevel["GROUND"] = "ground";
    ServiceLevel["TWO_DAY"] = "two_day";
    ServiceLevel["OVERNIGHT"] = "overnight";
    ServiceLevel["INTERNATIONAL"] = "international";
    ServiceLevel["ECONOMY"] = "economy";
})(ServiceLevel = exports.ServiceLevel || (exports.ServiceLevel = {}));
var PackageType;
(function (PackageType) {
    PackageType["CUSTOM"] = "custom";
    PackageType["ENVELOPE"] = "envelope";
    PackageType["PAK"] = "pak";
    PackageType["TUBE"] = "tube";
    PackageType["BOX_SMALL"] = "box_small";
    PackageType["BOX_MEDIUM"] = "box_medium";
    PackageType["BOX_LARGE"] = "box_large";
    PackageType["PALLET"] = "pallet";
})(PackageType = exports.PackageType || (exports.PackageType = {}));
// Custom Error Classes
class ShipmentNotFoundError extends Error {
    constructor(shipmentId) {
        super(`Shipment with ID ${shipmentId} not found`);
        this.name = 'ShipmentNotFoundError';
    }
}
exports.ShipmentNotFoundError = ShipmentNotFoundError;
class ShipmentValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ShipmentValidationError';
    }
}
exports.ShipmentValidationError = ShipmentValidationError;
class CarrierApiError extends Error {
    constructor(message, carrier, code) {
        super(message);
        this.carrier = carrier;
        this.code = code;
        this.name = 'CarrierApiError';
    }
}
exports.CarrierApiError = CarrierApiError;
// Main Shipments Class
class Shipments {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List shipments with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.carrier)
            queryParams.append('carrier', params.carrier);
        if (params === null || params === void 0 ? void 0 : params.order_id)
            queryParams.append('order_id', params.order_id);
        if (params === null || params === void 0 ? void 0 : params.customer_id)
            queryParams.append('customer_id', params.customer_id);
        if (params === null || params === void 0 ? void 0 : params.date_from)
            queryParams.append('date_from', params.date_from.toISOString());
        if (params === null || params === void 0 ? void 0 : params.date_to)
            queryParams.append('date_to', params.date_to.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `shipments?${queryParams.toString()}`);
        return response.shipments;
    }
    /**
     * Get shipping rates
     */
    async getRates(shipmentData) {
        const response = await this.stateset.request('POST', 'shipments/rates', shipmentData);
        return response.rates;
    }
    /**
     * Create shipment and generate label
     */
    async create(shipmentData) {
        try {
            const response = await this.stateset.request('POST', 'shipments', shipmentData);
            return response.shipment;
        }
        catch (error) {
            if (error.status === 400) {
                throw new ShipmentValidationError(error.message);
            }
            if (error.carrier_error) {
                throw new CarrierApiError(error.message, error.carrier, error.carrier_code);
            }
            throw error;
        }
    }
    /**
     * Update shipment
     */
    async update(shipmentId, shipmentData) {
        try {
            const response = await this.stateset.request('PUT', `shipments/${shipmentId}`, shipmentData);
            return response.shipment;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ShipmentNotFoundError(shipmentId);
            }
            throw error;
        }
    }
    /**
     * Package management methods
     */
    async addPackage(shipmentId, packageData) {
        const response = await this.stateset.request('POST', `shipments/${shipmentId}/packages`, packageData);
        return response.shipment;
    }
    async updatePackage(shipmentId, packageId, packageData) {
        const response = await this.stateset.request('PUT', `shipments/${shipmentId}/packages/${packageId}`, packageData);
        return response.shipment;
    }
    /**
     * Generate return label
     */
    async generateReturnLabel(shipmentId, returnData) {
        const response = await this.stateset.request('POST', `shipments/${shipmentId}/return-label`, returnData);
        return response.label;
    }
    /**
     * Tracking methods
     */
    async getTrackingDetails(shipmentId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.include_proof_of_delivery) {
            queryParams.append('include_pod', 'true');
        }
        const response = await this.stateset.request('GET', `shipments/${shipmentId}/tracking?${queryParams.toString()}`);
        return response.tracking;
    }
    /**
     * Get shipment metrics
     */
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.carrier)
            queryParams.append('carrier', params.carrier);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `shipments/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
}
exports.default = Shipments;
