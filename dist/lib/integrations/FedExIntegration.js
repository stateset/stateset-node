"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class FedExIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.fedex.com');
    }
    async getRates(data) {
        return this.request('POST', 'rates', data);
    }
    async createShipment(data) {
        return this.request('POST', 'shipments', data);
    }
    async getShipments() {
        return this.request('GET', 'shipments');
    }
    async getShipment(shipmentId) {
        return this.request('GET', `shipments/${shipmentId}`);
    }
    async cancelShipment(shipmentId) {
        return this.request('DELETE', `shipments/${shipmentId}`);
    }
    async getTrackingInfo(shipmentId) {
        return this.request('GET', `shipments/${shipmentId}/tracking`);
    }
}
exports.default = FedExIntegration;
//# sourceMappingURL=FedExIntegration.js.map