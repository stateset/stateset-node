import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ResourceUtilizationStatus {
    AVAILABLE = "AVAILABLE",
    IN_USE = "IN_USE",
    MAINTENANCE = "MAINTENANCE",
    RESERVED = "RESERVED"
}
export declare enum ResourceCategory {
    WAREHOUSE = "WAREHOUSE",
    MANUFACTURING = "MANUFACTURING",
    STAFFING = "STAFFING"
}
export interface ResourceUtilizationData {
    resource_id: NonEmptyString<string>;
    category: ResourceCategory;
    status: ResourceUtilizationStatus;
    utilization_start: Timestamp;
    utilization_end?: Timestamp;
    warehouse_id?: NonEmptyString<string>;
    manufacture_order_id?: NonEmptyString<string>;
    employee_id?: NonEmptyString<string>;
    capacity: number;
    utilized_capacity: number;
    efficiency: number;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface ResourceUtilizationResponse {
    id: NonEmptyString<string>;
    object: 'resource_utilization';
    data: ResourceUtilizationData;
}
export declare class ResourceUtilizationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ResourceUtilizationNotFoundError extends ResourceUtilizationError {
    constructor(resourceUtilizationId: string);
}
export declare class ResourceUtilizationValidationError extends ResourceUtilizationError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class ResourceUtilization {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateResourceUtilizationData;
    private mapResponse;
    list(params?: {
        resource_id?: string;
        category?: ResourceCategory;
        status?: ResourceUtilizationStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        resource_utilizations: ResourceUtilizationResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(resourceUtilizationId: NonEmptyString<string>): Promise<ResourceUtilizationResponse>;
    create(data: ResourceUtilizationData): Promise<ResourceUtilizationResponse>;
    update(resourceUtilizationId: NonEmptyString<string>, data: Partial<ResourceUtilizationData>): Promise<ResourceUtilizationResponse>;
    delete(resourceUtilizationId: NonEmptyString<string>): Promise<void>;
    updateUtilization(resourceUtilizationId: NonEmptyString<string>, utilizationData: {
        utilized_capacity: number;
        efficiency: number;
        utilization_end?: Timestamp;
    }): Promise<ResourceUtilizationResponse>;
    private handleError;
}
export {};
