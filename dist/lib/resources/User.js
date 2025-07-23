"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationError = exports.UserNotFoundError = exports.UserError = exports.UserRole = exports.UserStatus = void 0;
// Enums
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["PENDING"] = "PENDING";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["STAFF"] = "STAFF";
    UserRole["TECHNICIAN"] = "TECHNICIAN";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
// Error Classes
class UserError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'UserError';
    }
}
exports.UserError = UserError;
class UserNotFoundError extends UserError {
    constructor(userId) {
        super(`User with ID ${userId} not found`, { userId });
    }
}
exports.UserNotFoundError = UserNotFoundError;
class UserValidationError extends UserError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.UserValidationError = UserValidationError;
class Users {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateUserData(data) {
        if (!data.first_name || !data.last_name) {
            throw new UserValidationError('First and last names are required');
        }
        if (!data.email)
            throw new UserValidationError('Email is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new UserValidationError('Invalid email format');
        }
    }
    mapResponse(data) {
        if (!data?.id)
            throw new UserError('Invalid response format');
        return {
            id: data.id,
            object: 'user',
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                status: data.status,
                role: data.role,
                password_hash: data.password_hash,
                address: data.address,
                last_login: data.last_login,
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
            if (params.status)
                queryParams.append('status', params.status);
            if (params.role)
                queryParams.append('role', params.role);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
        }
        try {
            const response = await this.stateset.request('GET', `users?${queryParams.toString()}`);
            return {
                users: response.users.map(this.mapResponse),
                pagination: {
                    total: response.total || response.users.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(userId) {
        try {
            const response = await this.stateset.request('GET', `users/${userId}`);
            return this.mapResponse(response.user);
        }
        catch (error) {
            throw this.handleError(error, 'get', userId);
        }
    }
    async create(data) {
        this.validateUserData(data);
        try {
            const response = await this.stateset.request('POST', 'users', data);
            return this.mapResponse(response.user);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(userId, data) {
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new UserValidationError('Invalid email format');
        }
        try {
            const response = await this.stateset.request('PUT', `users/${userId}`, data);
            return this.mapResponse(response.user);
        }
        catch (error) {
            throw this.handleError(error, 'update', userId);
        }
    }
    async delete(userId) {
        try {
            await this.stateset.request('DELETE', `users/${userId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', userId);
        }
    }
    async updateRole(userId, role) {
        try {
            const response = await this.stateset.request('PUT', `users/${userId}/role`, { role });
            return this.mapResponse(response.user);
        }
        catch (error) {
            throw this.handleError(error, 'updateRole', userId);
        }
    }
    async resetPassword(userId, newPassword) {
        if (!newPassword || newPassword.length < 8) {
            throw new UserValidationError('New password must be at least 8 characters long');
        }
        try {
            await this.stateset.request('POST', `users/${userId}/reset-password`, { password: newPassword });
        }
        catch (error) {
            throw this.handleError(error, 'resetPassword', userId);
        }
    }
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
        }
        try {
            const response = await this.stateset.request('GET', `users/metrics?${queryParams.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, userId) {
        if (error.status === 404)
            throw new UserNotFoundError(userId || 'unknown');
        if (error.status === 400)
            throw new UserValidationError(error.message, error.errors);
        throw new UserError(`Failed to ${operation} user: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Users;
//# sourceMappingURL=User.js.map