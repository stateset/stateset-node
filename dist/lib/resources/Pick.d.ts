import { stateset } from '../../stateset-client';
export declare enum PickStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    QUALITY_CHECK = "QUALITY_CHECK",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PickType {
    SINGLE_ORDER = "single_order",
    BATCH = "batch",
    ZONE = "zone",
    WAVE = "wave",
    CLUSTER = "cluster"
}
export declare enum PickPriority {
    URGENT = "urgent",
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
export declare enum PickMethod {
    DISCRETE = "discrete",
    BATCH = "batch",
    ZONE = "zone",
    WAVE = "wave",
    CLUSTER = "cluster"
}
export interface PickLocation {
    zone_id: string;
    aisle: string;
    rack: string;
    shelf: string;
    bin: string;
    sequence_number: number;
}
export interface PickItem {
    item_id: string;
    sku: string;
    product_name: string;
    quantity_requested: number;
    quantity_picked: number;
    unit_of_measure: string;
    location: PickLocation;
    batch_number?: string;
    lot_number?: string;
    expiration_date?: string;
    substitutions_allowed: boolean;
    substitute_items?: string[];
    status: 'pending' | 'picked' | 'partial' | 'substituted' | 'unavailable';
    pick_notes?: string[];
}
export interface PickerAssignment {
    picker_id: string;
    name: string;
    assigned_at: string;
    equipment_id?: string;
    zone_restrictions?: string[];
    certifications?: string[];
}
export interface PickRoute {
    optimized_sequence: PickLocation[];
    estimated_distance: number;
    estimated_time: number;
    zone_sequence?: string[];
    equipment_required?: string[];
    special_instructions?: string[];
}
export interface QualityCheck {
    checker_id: string;
    checked_at: string;
    items_checked: Array<{
        item_id: string;
        passed: boolean;
        issues?: string[];
        notes?: string;
    }>;
    overall_status: 'passed' | 'failed' | 'partial';
}
export interface PickMetrics {
    total_items: number;
    total_quantity: number;
    picked_items: number;
    picked_quantity: number;
    accuracy_rate: number;
    completion_rate: number;
    picking_time: number;
    distance_traveled: number;
    picks_per_hour: number;
}
export interface PickData {
    order_ids: string[];
    warehouse_id: string;
    type: PickType;
    priority: PickPriority;
    method: PickMethod;
    items: PickItem[];
    picker_assignment?: PickerAssignment;
    route?: PickRoute;
    due_date?: string;
    start_time?: string;
    end_time?: string;
    quality_check?: QualityCheck;
    metrics?: PickMetrics;
    batch_id?: string;
    wave_id?: string;
    special_instructions?: string[];
    org_id?: string;
}
export interface PickResponse {
    id: string;
    created_at: string;
    updated_at: string;
    status: PickStatus;
    data: PickData;
}
export declare class PickNotFoundError extends Error {
    constructor(pickId: string);
}
export declare class PickValidationError extends Error {
    constructor(message: string);
}
export declare class PickOperationError extends Error {
    constructor(message: string);
}
declare class Picks {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List picks with optional filtering
     */
    list(params?: {
        status?: PickStatus;
        type?: PickType;
        priority?: PickPriority;
        warehouse_id?: string;
        picker_id?: string;
        batch_id?: string;
        wave_id?: string;
        org_id?: string;
    }): Promise<PickResponse[]>;
    /**
     * Get specific pick
     * @param pickId - Pick ID
     * @returns PickResponse object
     */
    get(pickId: string): Promise<PickResponse>;
    /**
     * Create new pick
     * @param pickData - PickData object
     * @returns PickResponse object
     */
    create(pickData: PickData): Promise<PickResponse>;
    /**
     * Update pick
     * @param pickId - Pick ID
     * @param pickData - Partial<PickData> object
     * @returns PickResponse object
     */
    update(pickId: string, pickData: Partial<PickData>): Promise<PickResponse>;
    /**
     * Delete pick
     * @param pickId - Pick ID
     */
    delete(pickId: string): Promise<void>;
    /**
     * Optimize pick route
     * @param pickId - Pick ID
     * @param params - Optional parameters
     * @returns PickRoute object
     */
    optimizeRoute(pickId: string, params?: {
        algorithm?: 'shortest_path' | 'nearest_neighbor' | 'genetic';
        constraints?: {
            max_distance?: number;
            max_time?: number;
            zone_restrictions?: string[];
        };
    }): Promise<PickRoute>;
    /**
     * Start pick operation
     * @param pickId - Pick ID
     * @param startData - Start data object
     * @returns PickResponse object
     */
    start(pickId: string, startData: {
        picker_id: string;
        equipment_id?: string;
    }): Promise<PickResponse>;
    /**
     * Record item pick
     * @param pickId - Pick ID
     * @param itemData - Item data object
     * @returns PickResponse object
     */
    recordItemPick(pickId: string, itemData: {
        item_id: string;
        quantity_picked: number;
        location?: PickLocation;
        batch_number?: string;
        notes?: string[];
    }): Promise<PickResponse>;
    /**
     * Complete quality check
     * @param pickId - Pick ID
     * @param checkData - Quality check data object
     * @returns PickResponse object
     */
    completeQualityCheck(pickId: string, checkData: QualityCheck): Promise<PickResponse>;
    /**
     * Complete pick
     * @param pickId - Pick ID
     * @param completionData - Completion data object
     * @returns PickResponse object
     */
    complete(pickId: string, completionData: {
        end_time: string;
        final_metrics?: Partial<PickMetrics>;
        notes?: string[];
    }): Promise<PickResponse>;
    /**
     * Get pick metrics
     * @param pickId - Pick ID
     * @returns PickMetrics object
     */
    getMetrics(pickId: string): Promise<PickMetrics>;
    /**
     * Validate pick data
     * @param data - PickData object
     */
    private validatePickData;
}
export default Picks;
