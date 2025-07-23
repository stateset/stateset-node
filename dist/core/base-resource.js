"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseResource = void 0;
const logger_1 = require("../utils/logger");
class BaseResource {
    resourceName;
    httpClient;
    constructor(httpClient, resourceName) {
        this.httpClient = httpClient;
        this.resourceName = resourceName;
    }
    /**
     * Get a single resource by ID
     */
    async get(params) {
        const { id, options = {} } = params;
        logger_1.logger.debug('Getting resource', {
            operation: 'get',
            resource: this.resourceName,
            metadata: { id },
        });
        const response = await this.httpClient.get(`${this.resourceName}/${id}`, options);
        return response[this.resourceName.slice(0, -1)] || response.data || response;
    }
    /**
     * List resources with optional filtering and pagination
     */
    async list(params = {}) {
        const { filters, sort, limit, offset, cursor, options = {} } = params;
        logger_1.logger.debug('Listing resources', {
            operation: 'list',
            resource: this.resourceName,
            metadata: { filters, sort, limit, offset, cursor },
        });
        const queryParams = {};
        if (filters) {
            Object.assign(queryParams, filters);
        }
        if (sort)
            queryParams.sort = sort;
        if (limit)
            queryParams.limit = limit;
        if (offset)
            queryParams.offset = offset;
        if (cursor)
            queryParams.cursor = cursor;
        const requestOptions = {
            ...options,
            params: queryParams,
        };
        const response = await this.httpClient.get(this.resourceName, requestOptions);
        // Handle different response formats
        if (response[this.resourceName]) {
            return {
                data: response[this.resourceName],
                has_more: response.has_more || false,
                total_count: response.total_count,
                next_cursor: response.next_cursor,
            };
        }
        if (Array.isArray(response.data)) {
            return {
                data: response.data,
                has_more: response.has_more || false,
                total_count: response.total_count,
                next_cursor: response.next_cursor,
            };
        }
        if (Array.isArray(response)) {
            return {
                data: response,
                has_more: false,
            };
        }
        throw new Error(`Unexpected response format for ${this.resourceName} list`);
    }
    /**
     * Create a new resource
     */
    async create(params) {
        const { data, options = {} } = params;
        logger_1.logger.debug('Creating resource', {
            operation: 'create',
            resource: this.resourceName,
            metadata: { data },
        });
        const response = await this.httpClient.post(this.resourceName, data, options);
        return response[this.resourceName.slice(0, -1)] || response.data || response;
    }
    /**
     * Update an existing resource
     */
    async update(params) {
        const { id, data, options = {} } = params;
        logger_1.logger.debug('Updating resource', {
            operation: 'update',
            resource: this.resourceName,
            metadata: { id, data },
        });
        const response = await this.httpClient.put(`${this.resourceName}/${id}`, data, options);
        return response[this.resourceName.slice(0, -1)] || response.data || response;
    }
    /**
     * Partially update an existing resource
     */
    async patch(params) {
        const { id, data, options = {} } = params;
        logger_1.logger.debug('Patching resource', {
            operation: 'patch',
            resource: this.resourceName,
            metadata: { id, data },
        });
        const response = await this.httpClient.patch(`${this.resourceName}/${id}`, data, options);
        return response[this.resourceName.slice(0, -1)] || response.data || response;
    }
    /**
     * Delete a resource
     */
    async delete(params) {
        const { id, options = {} } = params;
        logger_1.logger.debug('Deleting resource', {
            operation: 'delete',
            resource: this.resourceName,
            metadata: { id },
        });
        await this.httpClient.delete(`${this.resourceName}/${id}`, options);
        return { success: true, id };
    }
    /**
     * Search resources
     */
    async search(params) {
        const { query, filters, limit, offset, cursor, options = {} } = params;
        logger_1.logger.debug('Searching resources', {
            operation: 'search',
            resource: this.resourceName,
            metadata: { query, filters, limit, offset, cursor },
        });
        const queryParams = { q: query };
        if (filters) {
            Object.assign(queryParams, filters);
        }
        if (limit)
            queryParams.limit = limit;
        if (offset)
            queryParams.offset = offset;
        if (cursor)
            queryParams.cursor = cursor;
        const requestOptions = {
            ...options,
            params: queryParams,
        };
        const response = await this.httpClient.get(`${this.resourceName}/search`, requestOptions);
        // Handle different response formats
        if (response[this.resourceName]) {
            return {
                data: response[this.resourceName],
                has_more: response.has_more || false,
                total_count: response.total_count,
                next_cursor: response.next_cursor,
            };
        }
        if (Array.isArray(response.data)) {
            return {
                data: response.data,
                has_more: response.has_more || false,
                total_count: response.total_count,
                next_cursor: response.next_cursor,
            };
        }
        return {
            data: Array.isArray(response) ? response : [],
            has_more: false,
        };
    }
    /**
     * Get resource count
     */
    async count(filters) {
        logger_1.logger.debug('Counting resources', {
            operation: 'count',
            resource: this.resourceName,
            metadata: { filters },
        });
        const queryParams = filters ? { ...filters } : {};
        const response = await this.httpClient.get(`${this.resourceName}/count`, { params: queryParams });
        return response.count;
    }
    /**
     * Check if a resource exists
     */
    async exists(id) {
        try {
            await this.get({ id });
            return true;
        }
        catch (error) {
            if (error.statusCode === 404) {
                return false;
            }
            throw error;
        }
    }
    /**
     * Bulk operations
     */
    async bulkCreate(items, options = {}) {
        logger_1.logger.debug('Bulk creating resources', {
            operation: 'bulk_create',
            resource: this.resourceName,
            metadata: { count: items.length },
        });
        const response = await this.httpClient.post(`${this.resourceName}/bulk`, { items }, options);
        return response[this.resourceName] || response.data || response;
    }
    async bulkUpdate(updates, options = {}) {
        logger_1.logger.debug('Bulk updating resources', {
            operation: 'bulk_update',
            resource: this.resourceName,
            metadata: { count: updates.length },
        });
        const response = await this.httpClient.put(`${this.resourceName}/bulk`, { updates }, options);
        return response[this.resourceName] || response.data || response;
    }
    async bulkDelete(ids, options = {}) {
        logger_1.logger.debug('Bulk deleting resources', {
            operation: 'bulk_delete',
            resource: this.resourceName,
            metadata: { count: ids.length },
        });
        await this.httpClient.request('DELETE', `${this.resourceName}/bulk`, { ids }, options);
        return { success: true, deleted: ids };
    }
    /**
     * Export resources
     */
    async export(format = 'json', filters, options = {}) {
        logger_1.logger.debug('Exporting resources', {
            operation: 'export',
            resource: this.resourceName,
            metadata: { format, filters },
        });
        const queryParams = { format };
        if (filters) {
            Object.assign(queryParams, filters);
        }
        const response = await this.httpClient.post(`${this.resourceName}/export`, {}, { ...options, params: queryParams });
        return response;
    }
    /**
     * Get resource schema/metadata
     */
    async getSchema() {
        const response = await this.httpClient.get(`${this.resourceName}/schema`);
        return response;
    }
}
exports.BaseResource = BaseResource;
//# sourceMappingURL=base-resource.js.map