import { stateset } from '../../stateset-client';
export declare enum ManufacturerOrderStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    IN_PRODUCTION = "IN_PRODUCTION",
    QUALITY_CHECK = "QUALITY_CHECK",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD"
}
export declare enum ProductionPriority {
    URGENT = "urgent",
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
export declare enum QualityCheckStatus {
    PENDING = "pending",
    PASSED = "passed",
    FAILED = "failed",
    CONDITIONAL = "conditional"
}
interface Metadata {
    [key: string]: any;
}
interface ProductionMilestones {
    materials_ready?: string;
    production_start?: string;
    quality_check?: string;
    packaging_start?: string;
    shipping_ready?: string;
}
export interface ProductionShift {
    shift_id: string;
    start_time: string;
    end_time: string;
    machine_id?: string;
    operator_id?: string;
}
export interface ProductionSchedule {
    start_date: string;
    end_date: string;
    shifts: ProductionShift[];
    milestone_dates: ProductionMilestones;
}
export interface MaterialRequirement {
    material_id: string;
    quantity: number;
    unit: string;
    allocated: boolean;
    warehouse_location?: string;
    substitute_materials?: string[];
    cost_per_unit?: number;
}
export interface QualitySpecification {
    parameter: string;
    minimum?: number;
    maximum?: number;
    target?: number;
    unit?: string;
    tolerance?: number;
    measurement_method?: string;
    critical: boolean;
}
export interface ProductionCosts {
    materials: number;
    labor: number;
    overhead: number;
    machine_time: number;
    additional_costs?: Record<string, number>;
    total: number;
    currency: string;
}
export interface ManufacturerOrderData {
    manufacturer_id: string;
    product_id: string;
    quantity: number;
    expected_completion_date: string;
    priority: ProductionPriority;
    production_schedule?: ProductionSchedule;
    material_requirements: MaterialRequirement[];
    quality_specifications: QualitySpecification[];
    packaging_requirements?: {
        packaging_type: string;
        units_per_package: number;
        special_instructions?: string[];
    };
    shipping_information?: {
        destination: string;
        shipping_method: string;
        tracking_number?: string;
    };
    production_notes?: string[];
    estimated_costs?: ProductionCosts;
    customer_id?: string;
    order_reference?: string;
    org_id?: string;
    metadata?: Metadata;
}
export interface ProductionUpdate {
    timestamp: string;
    stage: string;
    completed_quantity: number;
    quality_metrics?: {
        inspected: number;
        passed: number;
        failed: number;
        rework: number;
    };
    machine_id?: string;
    operator_id?: string;
    notes?: string;
    issues?: Array<{
        type: string;
        description: string;
        severity: string;
        resolution?: string;
    }>;
}
export interface QualityCheckResult {
    status: QualityCheckStatus;
    inspector_id: string;
    inspection_date: string;
    measurements: Array<{
        parameter: string;
        value: number;
        unit: string;
        passed: boolean;
        notes?: string;
    }>;
    defects_found?: Array<{
        type: string;
        quantity: number;
        severity: string;
        images?: string[];
    }>;
    overall_notes?: string;
    corrective_actions?: string[];
}
interface BaseManufacturerOrderResponse {
    id: string;
    object: 'manufacturerorder';
    created_at: string;
    updated_at: string;
    status: ManufacturerOrderStatus;
    data: ManufacturerOrderData;
}
export type ManufacturerOrderResponse = BaseManufacturerOrderResponse & {
    [K in ManufacturerOrderStatus]: {
        status: K;
    } & (K extends ManufacturerOrderStatus.IN_PRODUCTION ? {
        inProduction: true;
        production_updates: ProductionUpdate[];
    } : K extends ManufacturerOrderStatus.QUALITY_CHECK ? {
        qualityCheck: true;
        quality_results?: QualityCheckResult;
    } : K extends ManufacturerOrderStatus.COMPLETED ? {
        completed: true;
        final_costs: ProductionCosts;
        quality_results: QualityCheckResult;
    } : K extends ManufacturerOrderStatus.CANCELLED ? {
        cancelled: true;
        cancellation_reason: string;
        cancellation_costs?: ProductionCosts;
    } : {});
}[ManufacturerOrderStatus];
export declare class ManufacturerOrderError extends Error {
    constructor(message: string, name: string);
}
export declare class ManufacturerOrderNotFoundError extends ManufacturerOrderError {
    constructor(orderId: string);
}
export declare class ManufacturerOrderStateError extends ManufacturerOrderError {
    constructor(message: string);
}
export declare class MaterialRequirementError extends ManufacturerOrderError {
    constructor(message: string);
}
export declare class ManufacturerOrders {
    private readonly client;
    constructor(client: stateset);
    private request;
    list(params?: {
        status?: ManufacturerOrderStatus;
        manufacturer_id?: string;
        product_id?: string;
        priority?: ProductionPriority;
        from_date?: Date;
        to_date?: Date;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        orders: ManufacturerOrderResponse[];
        total: number;
    }>;
    get(orderId: string): Promise<ManufacturerOrderResponse>;
    create(orderData: ManufacturerOrderData): Promise<ManufacturerOrderResponse>;
    update(orderId: string, orderData: Partial<ManufacturerOrderData>): Promise<ManufacturerOrderResponse>;
    delete(orderId: string): Promise<void>;
    submit(orderId: string): Promise<ManufacturerOrderResponse>;
    startProduction(orderId: string, startData?: {
        machine_id?: string;
        operator_id?: string;
        start_notes?: string;
    }): Promise<ManufacturerOrderResponse>;
    submitQualityCheck(orderId: string, qualityData: QualityCheckResult): Promise<ManufacturerOrderResponse>;
    complete(orderId: string, completionData: {
        final_quantity: number;
        completion_notes?: string;
    }): Promise<ManufacturerOrderResponse>;
    cancel(orderId: string, cancellationData: {
        reason: string;
        cancellation_costs?: ProductionCosts;
    }): Promise<ManufacturerOrderResponse>;
    updateProductionStatus(orderId: string, update: ProductionUpdate): Promise<ManufacturerOrderResponse>;
    getProductionHistory(orderId: string, params?: {
        from_date?: Date;
        to_date?: Date;
        stage?: string;
    }): Promise<ProductionUpdate[]>;
    updateCosts(orderId: string, costs: ProductionCosts): Promise<ManufacturerOrderResponse>;
    allocateMaterials(orderId: string, materialAllocations: Array<{
        material_id: string;
        quantity: number;
        warehouse_location: string;
    }>): Promise<ManufacturerOrderResponse>;
    getManufacturingMetrics(params?: {
        from_date?: Date;
        to_date?: Date;
        manufacturer_id?: string;
        org_id?: string;
    }): Promise<{
        total_orders: number;
        completed_orders: number;
        average_production_time: number;
        quality_pass_rate: number;
        total_costs: number;
        status_breakdown: Record<ManufacturerOrderStatus, number>;
    }>;
}
export default ManufacturerOrders;
