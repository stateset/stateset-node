import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum RouteStatus {
    PLANNED = "PLANNED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface RouteData {
    carrier_id: NonEmptyString<string>;
    status: RouteStatus;
    start_location: {
        warehouse_id?: string;
        address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };
    end_location: {
        customer_id?: string;
        address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };
    shipment_ids: NonEmptyString<string>[];
    estimated_distance: number;
    actual_distance?: number;
    estimated_duration: number;
    actual_duration?: number;
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
export interface RouteResponse {
    id: NonEmptyString<string>;
    object: 'route';
    data: RouteData;
}
export declare class RouteError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class RouteNotFoundError extends RouteError {
    constructor(routeId: string);
}
export declare class RouteValidationError extends RouteError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Routes {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateRouteData;
    private mapResponse;
    list(params?: {
        carrier_id?: string;
        status?: RouteStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        routes: RouteResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(routeId: NonEmptyString<string>): Promise<RouteResponse>;
    create(data: RouteData): Promise<RouteResponse>;
    update(routeId: NonEmptyString<string>, data: Partial<RouteData>): Promise<RouteResponse>;
    delete(routeId: NonEmptyString<string>): Promise<void>;
    optimizeRoute(routeId: NonEmptyString<string>): Promise<RouteResponse>;
    private handleError;
}
export {};
