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
export interface ProductionSchedule {
    start_date: string;
    end_date: string;
    shifts: Array<{
        shift_id: string;
        start_time: string;
        end_time: string;
        machine_id?: string;
        operator_id?: string;
    }>;
    milestone_dates: {
        materials_ready?: string;
        production_start?: string;
        quality_check?: string;
        packaging_start?: string;
        shipping_ready?: string;
    };
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
interface DraftManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.DRAFT;
    draft: true;
}
interface SubmittedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.SUBMITTED;
    submitted: true;
}
interface InProductionManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.IN_PRODUCTION;
    inProduction: true;
    production_updates: ProductionUpdate[];
}
interface QualityCheckManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.QUALITY_CHECK;
    qualityCheck: true;
    quality_results?: QualityCheckResult;
}
interface CompletedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.COMPLETED;
    completed: true;
    final_costs: ProductionCosts;
    quality_results: QualityCheckResult;
}
interface CancelledManufacturerOrderResponse extends BaseManufacturerOrderResponse {
    status: ManufacturerOrderStatus.CANCELLED;
    cancelled: true;
    cancellation_reason: string;
    cancellation_costs?: ProductionCosts;
}
export type ManufacturerOrderResponse = DraftManufacturerOrderResponse | SubmittedManufacturerOrderResponse | InProductionManufacturerOrderResponse | QualityCheckManufacturerOrderResponse | CompletedManufacturerOrderResponse | CancelledManufacturerOrderResponse;
export declare class ManufacturerOrderNotFoundError extends Error {
    constructor(orderId: string);
}
export declare class ManufacturerOrderStateError extends Error {
    constructor(message: string);
}
export declare class MaterialRequirementError extends Error {
    constructor(message: string);
}
declare class ManufacturerOrders {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List manufacturer orders with optional filtering
     */
    list(params?: {
        status?: ManufacturerOrderStatus;
        manufacturer_id?: string;
        product_id?: string;
        priority?: ProductionPriority;
        from_date?: Date;
        to_date?: Date;
        org_id?: string;
    }): Promise<ManufacturerOrderResponse[]>;
    /**
     * Get specific manufacturer order by ID
     */
    get(orderId: string): Promise<ManufacturerOrderResponse>;
    /**
     * Create new manufacturer order
     */
    create(orderData: ManufacturerOrderData): Promise<ManufacturerOrderResponse>;
    /**
     * Update existing manufacturer order
     */
    update(orderId: string, orderData: Partial<ManufacturerOrderData>): Promise<ManufacturerOrderResponse>;
    /**
     * Delete manufacturer order
     */
    delete(orderId: string): Promise<void>;
    /**
     * Status management methods
     */
    submit(orderId: string): Promise<SubmittedManufacturerOrderResponse>;
    startProduction(orderId: string, startData?: {
        machine_id?: string;
        operator_id?: string;
        start_notes?: string;
    }): Promise<InProductionManufacturerOrderResponse>;
    submitQualityCheck(orderId: string, qualityData: QualityCheckResult): Promise<QualityCheckManufacturerOrderResponse>;
    complete(orderId: string, completionData: {
        final_quantity: number;
        completion_notes?: string;
    }): Promise<CompletedManufacturerOrderResponse>;
    cancel(orderId: string, cancellationData: {
        reason: string;
        cancellation_costs?: ProductionCosts;
    }): Promise<CancelledManufacturerOrderResponse>;
    /**
     * Production management methods
     */
    updateProductionStatus(orderId: string, update: ProductionUpdate): Promise<InProductionManufacturerOrderResponse>;
    getProductionHistory(orderId: string, params?: {
        from_date?: Date;
        to_date?: Date;
        stage?: string;
    }): Promise<ProductionUpdate[]>;
    /**
     * Cost tracking methods
     */
    updateCosts(orderId: string, costs: ProductionCosts): Promise<ManufacturerOrderResponse>;
    /**
     * Material management methods
     */
    allocateMaterials(orderId: string, materialAllocations: Array<{
        material_id: string;
        quantity: number;
        warehouse_location: string;
    }>): Promise<ManufacturerOrderResponse>;
}
export default ManufacturerOrders;
