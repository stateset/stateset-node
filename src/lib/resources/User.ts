import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  TECHNICIAN = 'TECHNICIAN',
  CUSTOMER = 'CUSTOMER',
}

// Interfaces
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
  password_hash?: string; // Optional, typically set during creation or reset
  address?: UserAddress;
  last_login?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface UserResponse {
  id: NonEmptyString<string>;
  object: 'user';
  data: UserData;
}

// Error Classes
export class UserError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserNotFoundError extends UserError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, { userId });
  }
}

export class UserValidationError extends UserError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Users extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'users', 'users');
    this.singleKey = 'user';
    this.listKey = 'users';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateUserData(data: UserData): void {
    if (!data.first_name || !data.last_name) {
      throw new UserValidationError('First and last names are required');
    }
    if (!data.email) throw new UserValidationError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new UserValidationError('Invalid email format');
    }
  }

  private mapResponse(data: any): UserResponse {
    if (!data?.id) throw new UserError('Invalid response format');
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

  override async list(params?: {
    status?: UserStatus;
    role?: UserRole;
    org_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    users: UserResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await super.list(params as any);
    const users = (response as any).users ?? response;

    return {
      users,
      pagination: (response as any).pagination || {
        total: users.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(userId: NonEmptyString<string>): Promise<UserResponse> {
    return super.get(userId);
  }

  override async create(data: UserData): Promise<UserResponse> {
    this.validateUserData(data);
    return super.create(data);
  }

  override async update(userId: NonEmptyString<string>, data: Partial<UserData>): Promise<UserResponse> {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new UserValidationError('Invalid email format');
    }
    return super.update(userId, data);
  }

  override async delete(userId: NonEmptyString<string>): Promise<void> {
    await super.delete(userId);
  }

  async updateRole(userId: NonEmptyString<string>, role: UserRole): Promise<UserResponse> {
    try {
      const response = await this.client.request('PUT', `users/${userId}/role`, { role });
      return this.mapResponse((response as any).user ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'updateRole', userId);
    }
  }

  async resetPassword(userId: NonEmptyString<string>, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new UserValidationError('New password must be at least 8 characters long');
    }
    try {
      await this.client.request('POST', `users/${userId}/reset-password`, {
        password: newPassword,
      });
    } catch (error: any) {
      throw this.handleError(error, 'resetPassword', userId);
    }
  }

  async getMetrics(params?: { org_id?: string; date_from?: Date; date_to?: Date }): Promise<{
    total_users: number;
    status_breakdown: Record<UserStatus, number>;
    role_breakdown: Record<UserRole, number>;
    average_login_frequency: number; // logins per day
  }> {
    const requestParams: Record<string, unknown> = {};
    if (params?.org_id) requestParams.org_id = params.org_id;
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    try {
      const response = await this.client.request('GET', 'users/metrics', undefined, {
        params: requestParams,
      });
      return (response as any).metrics ?? response;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, _operation: string, _userId?: string): never {
    throw error;
  }
}
