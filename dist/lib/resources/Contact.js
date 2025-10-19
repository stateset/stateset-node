"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidationError = exports.ContactNotFoundError = exports.ContactError = exports.ContactStatus = exports.ContactType = void 0;
// Enums
var ContactType;
(function (ContactType) {
    ContactType["CUSTOMER"] = "CUSTOMER";
    ContactType["SUPPLIER"] = "SUPPLIER";
    ContactType["VENDOR"] = "VENDOR";
    ContactType["EMPLOYEE"] = "EMPLOYEE";
})(ContactType || (exports.ContactType = ContactType = {}));
var ContactStatus;
(function (ContactStatus) {
    ContactStatus["ACTIVE"] = "ACTIVE";
    ContactStatus["INACTIVE"] = "INACTIVE";
    ContactStatus["PENDING"] = "PENDING";
})(ContactStatus || (exports.ContactStatus = ContactStatus = {}));
// Error Classes
class ContactError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ContactError';
    }
}
exports.ContactError = ContactError;
class ContactNotFoundError extends ContactError {
    constructor(contactId) {
        super(`Contact with ID ${contactId} not found`, { contactId });
    }
}
exports.ContactNotFoundError = ContactNotFoundError;
class ContactValidationError extends ContactError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ContactValidationError = ContactValidationError;
class Contacts {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateContactData(data) {
        if (!data.entity_id)
            throw new ContactValidationError('Entity ID is required');
        if (!data.first_name || !data.last_name)
            throw new ContactValidationError('First and last name are required');
        if (!data.email && !data.phone)
            throw new ContactValidationError('At least one of email or phone is required');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new ContactError('Invalid response format');
        return {
            id: data.id,
            object: 'contact',
            data: {
                entity_id: data.entity_id,
                type: data.type,
                status: data.status,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                job_title: data.job_title,
                address: data.address,
                is_primary: data.is_primary,
                notes: data.notes,
                created_at: data.created_at,
                updated_at: data.updated_at,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.entity_id)
                queryParams.append('entity_id', params.entity_id);
            if (params.type)
                queryParams.append('type', params.type);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
        }
        try {
            const response = await this.stateset.request('GET', `contacts?${queryParams.toString()}`);
            return {
                contacts: response.contacts.map(this.mapResponse),
                pagination: {
                    total: response.total || response.contacts.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(contactId) {
        try {
            const response = await this.stateset.request('GET', `contacts/${contactId}`);
            return this.mapResponse(response.contact);
        }
        catch (error) {
            throw this.handleError(error, 'get', contactId);
        }
    }
    async create(data) {
        this.validateContactData(data);
        try {
            const response = await this.stateset.request('POST', 'contacts', data);
            return this.mapResponse(response.contact);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(contactId, data) {
        try {
            const response = await this.stateset.request('PUT', `contacts/${contactId}`, data);
            return this.mapResponse(response.contact);
        }
        catch (error) {
            throw this.handleError(error, 'update', contactId);
        }
    }
    async delete(contactId) {
        try {
            await this.stateset.request('DELETE', `contacts/${contactId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', contactId);
        }
    }
    async setPrimary(contactId) {
        try {
            const response = await this.stateset.request('POST', `contacts/${contactId}/set_primary`, {});
            return this.mapResponse(response.contact);
        }
        catch (error) {
            throw this.handleError(error, 'setPrimary', contactId);
        }
    }
    handleError(error, operation, contactId) {
        if (error.status === 404)
            throw new ContactNotFoundError(contactId || 'unknown');
        if (error.status === 400)
            throw new ContactValidationError(error.message, error.errors);
        throw new ContactError(`Failed to ${operation} contact: ${error.message}`, {
            operation,
            originalError: error,
        });
    }
}
exports.default = Contacts;
//# sourceMappingURL=Contact.js.map