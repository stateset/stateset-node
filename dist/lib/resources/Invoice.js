"use strict";
// lib/resources/Invoice.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Invoices {
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_invoices_by_pk) {
            throw new Error('Unexpected response format');
        }
        const invoiceData = response.update_invoices_by_pk;
        const baseResponse = {
            id: invoiceData.id,
            object: 'invoice',
            status: invoiceData.status,
        };
        switch (invoiceData.status) {
            case 'DRAFT':
                return { ...baseResponse, status: 'DRAFT', draft: true };
            case 'SENT':
                return { ...baseResponse, status: 'SENT', sent: true };
            case 'PAID':
                return { ...baseResponse, status: 'PAID', paid: true };
            case 'OVERDUE':
                return { ...baseResponse, status: 'OVERDUE', overdue: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected invoice status: ${invoiceData.status}`);
        }
    }
    async create(data) {
        const response = await this.client.request('POST', 'invoices', data);
        return this.handleCommandResponse(response);
    }
    async get(id) {
        const response = await this.client.request('GET', `invoices/${id}`);
        return this.handleCommandResponse({ update_invoices_by_pk: response });
    }
    async update(id, data) {
        const response = await this.client.request('PUT', `invoices/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async list(params) {
        const response = await this.client.request('GET', 'invoices', params);
        return response.map((invoice) => this.handleCommandResponse({ update_invoices_by_pk: invoice }));
    }
    async delete(id) {
        await this.client.request('DELETE', `invoices/${id}`);
    }
    async getLines(id) {
        return this.client.request('GET', `invoices/${id}/lines`);
    }
    async updateLines(id, data) {
        const response = await this.client.request('PUT', `invoices/${id}/lines`, data);
        return this.handleCommandResponse(response);
    }
    async send(id) {
        const response = await this.client.request('POST', `invoices/${id}/send`);
        return this.handleCommandResponse(response);
    }
    async markAsPaid(id) {
        const response = await this.client.request('POST', `invoices/${id}/mark-paid`);
        return this.handleCommandResponse(response);
    }
    async cancel(id) {
        const response = await this.client.request('POST', `invoices/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
    async reminder(id) {
        const response = await this.client.request('POST', `invoices/${id}/reminder`);
        return this.handleCommandResponse(response);
    }
}
exports.default = Invoices;
