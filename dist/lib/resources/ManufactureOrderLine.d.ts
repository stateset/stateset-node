import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ManufactureOrderLineStatus {
    PLANNED = "PLANNED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    ON_HOLD = "ON_HOLD",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
}
export declare enum ManufactureOrderLineType {
    RAW_MATERIAL = "RAW_MATERIAL",
    COMPONENT = "COMPONENT",
    FINISHED_GOOD = "FINISHED_GOOD",
    BYPRODUCT = "BYPRODUCT",
    SCRAP = "SCRAP"
}
export interface ManufactureOrderLineItem {
    item_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    description: string;
    quantity: number;
    unit_of_measure: string;
    unit_cost: number;
    total_cost: number;
    currency: string;
}
export interface ManufactureOrderLineData {
    manufacture_order_id: NonEmptyString<string>;
    type: ManufactureOrderLineType;
    status: ManufactureOrderLineStatus;
    item: ManufactureOrderLineItem;
    work_center_id?: NonEmptyString<string>;
    production?: {
        planned_start: Timestamp;
        actual_start?: Timestamp;
        planned_end: Timestamp;
        actual_end?: Timestamp;
        produced_quantity: number;
        operator_id?: string;
    };
    material_requirements?: Array<{
        material_id: NonEmptyString<string>;
        quantity_required: number;
        quantity_consumed: number;
        unit_of_measure: string;
    }>;
    quality_check?: {
        parameter: string;
        specification: string;
        actual_value?: string;
        passed?: boolean;
        checked_at?: Timestamp;
        checked_by?: string;
    };
    cost_details: {
        estimated_cost: number;
        actual_cost?: number;
        currency: string;
        cost_breakdown?: Array<{
            category: 'LABOR' | 'MATERIAL' | 'OVERHEAD';
            amount: number;
            description?: string;
        }>;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    status_history: Array<{
        status: ManufactureOrderLineStatus;
        changed_at: Timestamp;
        changed_by?: string;
        reason?: string;
    }>;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface ManufactureOrderLineResponse {
    id: NonEmptyString<string>;
    object: 'manufacture_order_line';
    data: ManufactureOrderLineData;
}
export declare class ManufactureOrderLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ManufactureOrderLineNotFoundError extends ManufactureOrderLineError {
    constructor(manufactureOrderLineId: string);
}
export declare class ManufactureOrderLineValidationError extends ManufactureOrderLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class ManufactureOrderLines {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateManufactureOrderLineData;
    private mapResponse;
    list(params?: {
        manufacture_order_id?: string;
        status?: ManufactureOrderLineStatus;
        type?: ManufactureOrderLineType;
        work_center_id?: string;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        manufacture_order_lines: ManufactureOrderLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(manufactureOrderLineId: NonEmptyString<string>): Promise<ManufactureOrderLineResponse>;
    create(data: ManufactureOrderLineData): Promise<ManufactureOrderLineResponse>;
    update(manufactureOrderLineId: NonEmptyString<string>, data: Partial<ManufactureOrderLineData>): Promise<ManufactureOrderLineResponse>;
    delete(manufactureOrderLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(manufactureOrderLineId: NonEmptyString<string>, status: ManufactureOrderLineStatus, reason?: string): Promise<ManufactureOrderLineResponse>;
    recordProduction(manufactureOrderLineId: NonEmptyString<string>, productionData: Partial<ManufactureOrderLineData['production']>): Promise<ManufactureOrderLineResponse>;
    submitQualityCheck(manufactureOrderLineId: NonEmptyString<string>, qualityCheckData: ManufactureOrderLineData['quality_check']): Promise<ManufactureOrderLineResponse>;
    getMetrics(params?: {
        manufacture_order_id?: string;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<ManufactureOrderLineStatus, number>;
        type_breakdown: Record<ManufactureOrderLineType, number>;
        production_efficiency: number;
        average_cost_per_unit: number;
        quality_pass_rate: number;
    }>;
    private handleError;
}
export {};
//# sourceMappingURL=ManufactureOrderLine.d.ts.map