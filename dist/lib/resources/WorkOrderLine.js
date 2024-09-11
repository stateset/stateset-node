"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WorkOrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'work_order_line_items');
    }
    async get(workOrderLineId) {
        return this.stateset.request('GET', `work_order_line_items/${workOrderLineId}`);
    }
    async create(workOrderLineData) {
        return this.stateset.request('POST', 'work_order_line_items', workOrderLineData);
    }
    async update(workOrderLineId, workOrderLineData) {
        return this.stateset.request('PUT', `work_order_line_items/${workOrderLineId}`, workOrderLineData);
    }
    async delete(workOrderLineId) {
        return this.stateset.request('DELETE', `work_order_line_items/${workOrderLineId}`);
    }
}
exports.default = WorkOrderLines;
