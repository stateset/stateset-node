import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED"
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    STAFF = "STAFF",
    TECHNICIAN = "TECHNICIAN",
    CUSTOMER = "CUSTOMER"
}
export interface UserAddress {
    line1: NonEmptyString<string>;
    line2?: string;
    city: NonEmptyString<string>;
    state: string;
    postal_code: NonEmptyString<string>;
    country: NonEmptyString<string>;
}
export interface UserData {
    first_name: NonEmptyString<string>;
    last_name: NonEmptyString<string>;
    email: NonEmptyString<string>;
    phone?: string;
    status: UserStatus;
    role: UserRole;
    password_hash?: string;
    address?: UserAddress;
    last_login?: Timestamp;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface UserResponse {
    id: NonEmptyString<string>;
    object: 'user';
    data: UserData;
}
export declare class UserError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class UserNotFoundError extends UserError {
    constructor(userId: string);
}
export declare class UserValidationError extends UserError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Users {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    private validateUserData;
    private mapResponse;
    list(params?: {
        status?: UserStatus;
        role?: UserRole;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        users: UserResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(userId: NonEmptyString<string>): Promise<UserResponse>;
    create(data: UserData): Promise<UserResponse>;
    update(userId: NonEmptyString<string>, data: Partial<UserData>): Promise<UserResponse>;
    delete(userId: NonEmptyString<string>): Promise<void>;
    updateRole(userId: NonEmptyString<string>, role: UserRole): Promise<UserResponse>;
    resetPassword(userId: NonEmptyString<string>, newPassword: string): Promise<void>;
    getMetrics(params?: {
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
    }): Promise<{
        total_users: number;
        status_breakdown: Record<UserStatus, number>;
        role_breakdown: Record<UserRole, number>;
        average_login_frequency: number;
    }>;
    private handleError;
}
export {};
//# sourceMappingURL=User.d.ts.map