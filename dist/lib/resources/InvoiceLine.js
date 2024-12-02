"use strict";
// lib/resources/InvoiceLine.ts
Object.defineProperty(exports, "__esModule", { value: true });
class InvoiceLines {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new invoice line
     * @param data - InvoiceLineItem object
     * @returns InvoiceLineItem object
     */
    async create(data) {
        return this.client.request('POST', 'invoice-lines', data);
    }
    /**
     * Get an invoice line by ID
     * @param id - Invoice line ID
     * @returns InvoiceLineItem object
     */
    async get(id) {
        return this.client.request('GET', `invoice-lines/${id}`);
    }
    /**
     * Update an invoice line
     * @param id - Invoice line ID
     * @param data - Partial<InvoiceLineItem> object
     * @returns InvoiceLineItem object
     */
    async update(id, data) {
        return this.client.request('PUT', `invoice-lines/${id}`, data);
    }
    /**
     * List invoice lines
     * @param params - Optional filtering parameters
     * @returns Array of InvoiceLineItem objects
     */
    async list(params) {
        return this.client.request('GET', 'invoice-lines', params);
    }
    /**
     * Delete an invoice line
     * @param id - Invoice line ID
     */
    async delete(id) {
        return this.client.request('DELETE', `invoice-lines/${id}`);
    }
    /**
     * Get payouts for an invoice line
     * @param id - Invoice line ID
     * @returns Array of Payout objects
     */
    async getPayouts(id) {
        return this.client.request('GET', `invoice-lines/${id}/payouts`);
    }
    /**
     * Update payouts for an invoice line
     * @param id - Invoice line ID
     * @param data - Array of Payout objects
     * @returns Array of Payout objects
     */
    async updatePayouts(id, data) {
        return this.client.request('PUT', `invoice-lines/${id}/payouts`, data);
    }
}
exports.default = InvoiceLines;
