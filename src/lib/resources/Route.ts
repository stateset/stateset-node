import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Interfaces
export interface RouteData {
  carrier_id: NonEmptyString<string>;
  status: RouteStatus;
  start_location: {
    warehouse_id?: string;
    address: { line1: string; city: string; state: string; postal_code: string; country: string };
  };
  end_location: {
    customer_id?: string;
    address: { line1: string; city: string; state: string; postal_code: string; country: string };
  };
  shipment_ids: NonEmptyString<string>[];
  estimated_distance: number; // in kilometers
  actual_distance?: number; // in kilometers
  estimated_duration: number; // in hours
  actual_duration?: number; // in hours
  cost_estimate: number;
  actual_cost?: number;
  currency: string;
  start_time: Timestamp;
  end_time?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface RouteResponse {
  id: NonEmptyString<string>;
  object: 'route';
  data: RouteData;
}

// Error Classes
export class RouteError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RouteError';
  }
}

export class RouteNotFoundError extends RouteError {
  constructor(routeId: string) {
    super(`Route with ID ${routeId} not found`, { routeId });
  }
}

export class RouteValidationError extends RouteError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Routes {
  constructor(private readonly stateset: ApiClientLike) {}

  private validateRouteData(data: RouteData): void {
    if (!data.carrier_id) throw new RouteValidationError('Carrier ID is required');
    if (!data.start_location.address.line1)
      throw new RouteValidationError('Start location address is required');
    if (!data.end_location.address.line1)
      throw new RouteValidationError('End location address is required');
    if (!data.shipment_ids?.length)
      throw new RouteValidationError('At least one shipment ID is required');
    if (data.estimated_distance < 0)
      throw new RouteValidationError('Estimated distance cannot be negative');
    if (data.estimated_duration < 0)
      throw new RouteValidationError('Estimated duration cannot be negative');
    if (data.cost_estimate < 0) throw new RouteValidationError('Cost estimate cannot be negative');
  }

  private mapResponse(data: any): RouteResponse {
    if (!data?.id) throw new RouteError('Invalid response format');
    return {
      id: data.id,
      object: 'route',
      data: {
        carrier_id: data.carrier_id,
        status: data.status,
        start_location: data.start_location,
        end_location: data.end_location,
        shipment_ids: data.shipment_ids,
        estimated_distance: data.estimated_distance,
        actual_distance: data.actual_distance,
        estimated_duration: data.estimated_duration,
        actual_duration: data.actual_duration,
        cost_estimate: data.cost_estimate,
        actual_cost: data.actual_cost,
        currency: data.currency,
        start_time: data.start_time,
        end_time: data.end_time,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    carrier_id?: string;
    status?: RouteStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    routes: RouteResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.carrier_id) queryParams.append('carrier_id', params.carrier_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `routes?${queryParams.toString()}`);
      return {
        routes: response.routes.map(this.mapResponse),
        pagination: {
          total: response.total || response.routes.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(routeId: NonEmptyString<string>): Promise<RouteResponse> {
    try {
      const response = await this.stateset.request('GET', `routes/${routeId}`);
      return this.mapResponse(response.route);
    } catch (error: any) {
      throw this.handleError(error, 'get', routeId);
    }
  }

  async create(data: RouteData): Promise<RouteResponse> {
    this.validateRouteData(data);
    try {
      const response = await this.stateset.request('POST', 'routes', data);
      return this.mapResponse(response.route);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(routeId: NonEmptyString<string>, data: Partial<RouteData>): Promise<RouteResponse> {
    try {
      const response = await this.stateset.request('PUT', `routes/${routeId}`, data);
      return this.mapResponse(response.route);
    } catch (error: any) {
      throw this.handleError(error, 'update', routeId);
    }
  }

  async delete(routeId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `routes/${routeId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', routeId);
    }
  }

  async optimizeRoute(routeId: NonEmptyString<string>): Promise<RouteResponse> {
    try {
      const response = await this.stateset.request('POST', `routes/${routeId}/optimize`, {});
      return this.mapResponse(response.route);
    } catch (error: any) {
      throw this.handleError(error, 'optimizeRoute', routeId);
    }
  }

  private handleError(error: any, operation: string, routeId?: string): never {
    if (error.status === 404) throw new RouteNotFoundError(routeId || 'unknown');
    if (error.status === 400) throw new RouteValidationError(error.message, error.errors);
    throw new RouteError(`Failed to ${operation} route: ${error.message}`, {
      operation,
      originalError: error,
    });
  }
}
