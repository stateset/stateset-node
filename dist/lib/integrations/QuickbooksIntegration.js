"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickbooksIntegrationError = exports.QuickbooksAccountType = exports.QuickbooksInvoiceStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var QuickbooksInvoiceStatus;
(function (QuickbooksInvoiceStatus) {
    QuickbooksInvoiceStatus["DRAFT"] = "Draft";
    QuickbooksInvoiceStatus["OPEN"] = "Open";
    QuickbooksInvoiceStatus["OVERDUE"] = "Overdue";
    QuickbooksInvoiceStatus["PAID"] = "Paid";
    QuickbooksInvoiceStatus["VOID"] = "Void";
})(QuickbooksInvoiceStatus || (exports.QuickbooksInvoiceStatus = QuickbooksInvoiceStatus = {}));
var QuickbooksAccountType;
(function (QuickbooksAccountType) {
    QuickbooksAccountType["ASSET"] = "Asset";
    QuickbooksAccountType["LIABILITY"] = "Liability";
    QuickbooksAccountType["EQUITY"] = "Equity";
    QuickbooksAccountType["INCOME"] = "Income";
    QuickbooksAccountType["EXPENSE"] = "Expense";
})(QuickbooksAccountType || (exports.QuickbooksAccountType = QuickbooksAccountType = {}));
// Error Classes
class QuickbooksIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'QuickbooksIntegrationError';
    }
}
exports.QuickbooksIntegrationError = QuickbooksIntegrationError;
class QuickbooksIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://quickbooks.api.intuit.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!field || !data[field]) {
                throw new QuickbooksIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getInvoices(params = {}) {
        const queryParams = new URLSearchParams({
            ...(params.query && { query: params.query }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
            return {
                invoices: response.QueryResponse.Invoice || [],
                pagination: {
                    total: response.QueryResponse.totalCount || response.QueryResponse.Invoice?.length || 0,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to fetch invoices', { originalError: error });
        }
    }
    async createInvoice(data) {
        this.validateRequestData(data, ['CustomerRef', 'Line', 'TotalAmt']);
        try {
            const response = await this.request('POST', 'v3/company/{companyId}/invoice', {
                Invoice: data,
            });
            return response.Invoice;
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to create invoice', { originalError: error });
        }
    }
    async getAccounts(params = {}) {
        const queryParams = new URLSearchParams({
            ...(params.query && { query: params.query }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
            return {
                accounts: response.QueryResponse.Account || [],
                pagination: {
                    total: response.QueryResponse.totalCount || response.QueryResponse.Account?.length || 0,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to fetch accounts', { originalError: error });
        }
    }
    async createAccount(data) {
        this.validateRequestData(data, ['Name', 'AccountType']);
        try {
            const response = await this.request('POST', 'v3/company/{companyId}/account', {
                Account: data,
            });
            return response.Account;
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to create account', { originalError: error });
        }
    }
    async getContacts(params = {}) {
        const queryParams = new URLSearchParams({
            ...(params.query && { query: params.query }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
            return {
                contacts: response.QueryResponse.Customer || response.QueryResponse.Vendor || [],
                pagination: {
                    total: response.QueryResponse.totalCount ||
                        (response.QueryResponse.Customer || response.QueryResponse.Vendor)?.length ||
                        0,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to fetch contacts', { originalError: error });
        }
    }
    async createContact(data) {
        this.validateRequestData(data, ['DisplayName', 'ContactType']);
        try {
            const endpoint = data.ContactType === 'Customer' ? 'customer' : 'vendor';
            const response = await this.request('POST', `v3/company/{companyId}/${endpoint}`, {
                [data.ContactType]: data,
            });
            return response[data.ContactType];
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to create contact', { originalError: error });
        }
    }
    async getPayments(params = {}) {
        const queryParams = new URLSearchParams({
            ...(params.query && { query: params.query }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `v3/company/{companyId}/query?${queryParams}`);
            return {
                payments: response.QueryResponse.Payment || [],
                pagination: {
                    total: response.QueryResponse.totalCount || response.QueryResponse.Payment?.length || 0,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to fetch payments', { originalError: error });
        }
    }
    async createPayment(data) {
        this.validateRequestData(data, ['CustomerRef', 'TotalAmt']);
        try {
            const response = await this.request('POST', 'v3/company/{companyId}/payment', {
                Payment: data,
            });
            return response.Payment;
        }
        catch (error) {
            throw new QuickbooksIntegrationError('Failed to create payment', { originalError: error });
        }
    }
}
exports.default = QuickbooksIntegration;
//# sourceMappingURL=QuickbooksIntegration.js.map