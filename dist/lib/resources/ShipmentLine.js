"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ShipmentLine {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'shipment_line_items');
    }
    async get(shipmentLineId) {
        return this.stateset.request('GET', `shipment_line_items/${shipmentLineId}`);
    }
    async create(shipmentLineData) {
        return this.stateset.request('POST', 'shipment_line_items', shipmentLineData);
    }
    async update(shipmentLineId, shipmentLineData) {
        return this.stateset.request('PUT', `shipment_line_items/${shipmentLineId}`, shipmentLineData);
    }
    async delete(shipmentLineId) {
        return this.stateset.request('DELETE', `shipment_line_items/${shipmentLineId}`);
    }
}
exports.default = ShipmentLine;
