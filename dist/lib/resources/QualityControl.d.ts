import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum QualityControlStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    PASSED = "PASSED",
    FAILED = "FAILED",
    ON_HOLD = "ON_HOLD"
}
export interface QualityControlData {
    order_id?: NonEmptyString<string>;
    product_id?: NonEmptyString<string>;
    status: QualityControlStatus;
    inspection_date: Timestamp;
    inspector_id: NonEmptyString<string>;
    standards: Array<{
        parameter: string;
        specification: string;
        tolerance?: {
            min: number;
            max: number;
            unit: string;
        };
    }>;
    results: Array<{
        parameter: string;
        actual_value: string;
        passed: boolean;
        notes?: string;
    }>;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface QualityControlResponse {
    id: NonEmptyString<string>;
    object: 'quality_control';
    data: QualityControlData;
}
export declare class QualityControlError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class QualityControlNotFoundError extends QualityControlError {
    constructor(qualityControlId: string);
}
export declare class QualityControlValidationError extends QualityControlError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class QualityControl {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    private validateQualityControlData;
    private mapResponse;
    list(params?: {
        order_id?: string;
        product_id?: string;
        status?: QualityControlStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        quality_controls: QualityControlResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(qualityControlId: NonEmptyString<string>): Promise<QualityControlResponse>;
    create(data: QualityControlData): Promise<QualityControlResponse>;
    update(qualityControlId: NonEmptyString<string>, data: Partial<QualityControlData>): Promise<QualityControlResponse>;
    delete(qualityControlId: NonEmptyString<string>): Promise<void>;
    recordResults(qualityControlId: NonEmptyString<string>, results: QualityControlData['results']): Promise<QualityControlResponse>;
    private handleError;
}
export {};
//# sourceMappingURL=QualityControl.d.ts.map