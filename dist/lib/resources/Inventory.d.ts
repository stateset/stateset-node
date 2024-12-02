import { stateset } from '../../stateset-client';
export declare enum InventoryStatus {
    IN_STOCK = "in_stock",
    LOW_STOCK = "low_stock",
    OUT_OF_STOCK = "out_of_stock",
    RESERVED = "reserved",
    DAMAGED = "damaged"
}
export declare enum LocationType {
    WAREHOUSE = "warehouse",
    STORE = "store",
    TRANSIT = "transit",
    SUPPLIER = "supplier",
    CUSTOMER = "customer"
}
export declare enum AdjustmentType {
    RECEIPT = "receipt",
    SHIPMENT = "shipment",
    RETURN = "return",
    DAMAGE = "damage",
    LOSS = "loss",
    ADJUSTMENT = "adjustment",
    CYCLE_COUNT = "cycle_count"
}
export interface InventoryLocation {
    id: string;
    name: string;
    type: LocationType;
    address?: string;
    zone?: string;
    bin?: string;
    rack?: string;
    shelf?: string;
    position?: string;
}
export interface InventoryMetadata {
    sku?: string;
    upc?: string;
    batch_number?: string;
    lot_number?: string;
    serial_number?: string;
    expiration_date?: string;
    manufactured_date?: string;
    supplier_id?: string;
    condition?: string;
    [key: string]: any;
}
export interface InventoryData {
    item_id: string;
    quantity: number;
    location: InventoryLocation;
    status: InventoryStatus;
    metadata?: InventoryMetadata;
    minimum_quantity?: number;
    maximum_quantity?: number;
    reorder_point?: number;
    reorder_quantity?: number;
    unit_cost?: number;
    unit_price?: number;
    org_id?: string;
}
export interface InventoryAdjustment {
    type: AdjustmentType;
    quantity: number;
    reason?: string;
    reference_id?: string;
    performed_by?: string;
    notes?: string;
}
export interface InventoryTransfer {
    from_location: string;
    to_location: string;
    quantity: number;
    reason?: string;
    tracking_number?: string;
    estimated_arrival?: string;
    shipping_method?: string;
}
export interface InventoryResponse {
    id: string;
    object: 'inventory';
    created_at: string;
    updated_at: string;
    data: InventoryData;
    total_value: number;
    available_quantity: number;
    reserved_quantity: number;
    damaged_quantity: number;
    pending_receipt_quantity: number;
    pending_shipment_quantity: number;
}
export interface InventoryHistoryEntry {
    timestamp: string;
    action: string;
    quantity_before: number;
    quantity_after: number;
    adjustment?: InventoryAdjustment;
    transfer?: InventoryTransfer;
    performed_by: string;
}
export declare class InventoryNotFoundError extends Error {
    constructor(inventoryId: string);
}
export declare class InsufficientInventoryError extends Error {
    constructor(message: string);
}
export declare class InventoryValidationError extends Error {
    constructor(message: string);
}
declare class Inventory {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * Validates inventory quantities and thresholds
     */
    private validateInventoryData;
    /**
     * List inventory with optional filtering
     */
    list(params?: {
        status?: InventoryStatus;
        location_type?: LocationType;
        low_stock?: boolean;
        expiring_before?: Date;
        org_id?: string;
    }): Promise<InventoryResponse[]>;
    /**
     * Get specific inventory by ID
     * @param inventoryId - Inventory ID
     * @returns InventoryResponse object
     */
    get(inventoryId: string): Promise<InventoryResponse>;
    /**
     * Create new inventory
     * @param inventoryData - InventoryData object
     * @returns InventoryResponse object
     */
    create(inventoryData: InventoryData): Promise<InventoryResponse>;
    /**
     * Update existing inventory
     * @param inventoryId - Inventory ID
     * @param inventoryData - Partial<InventoryData> object
     * @returns InventoryResponse object
     */
    update(inventoryId: string, inventoryData: Partial<InventoryData>): Promise<InventoryResponse>;
    /**
     * Delete inventory
     * @param inventoryId - Inventory ID
     */
    delete(inventoryId: string): Promise<void>;
    /**
     * Adjust inventory quantity
     * @param inventoryId - Inventory ID
     * @param adjustment - InventoryAdjustment object
     * @returns InventoryResponse object
     */
    adjustQuantity(inventoryId: string, adjustment: InventoryAdjustment): Promise<InventoryResponse>;
    /**
     * Transfer inventory between locations
     * @param transfer - InventoryTransfer object
     * @returns Object with source, destination, and transfer_id
     */
    transfer(transfer: InventoryTransfer): Promise<{
        source: InventoryResponse;
        destination: InventoryResponse;
        transfer_id: string;
    }>;
    /**
     * Get inventory history
     * @param inventoryId - Inventory ID
     * @param params - Optional filtering parameters
     * @returns Array of InventoryHistoryEntry objects
     */
    getHistory(inventoryId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        action_type?: AdjustmentType;
        limit?: number;
    }): Promise<InventoryHistoryEntry[]>;
    /**
     * Reserve inventory
     * @param inventoryId - Inventory ID
     * @param quantity - Number of items to reserve
     * @param params - Optional reservation parameters
     * @returns InventoryResponse object
     */
    reserve(inventoryId: string, quantity: number, params?: {
        order_id?: string;
        reservation_expires?: Date;
        notes?: string;
    }): Promise<InventoryResponse>;
    /**
     * Release reserved inventory
     * @param inventoryId - Inventory ID
     * @param reservationId - Reservation ID
     * @returns InventoryResponse object
     */
    releaseReservation(inventoryId: string, reservationId: string): Promise<InventoryResponse>;
    /**
     * Get low stock alerts
     * @param params - Optional filtering parameters
     * @returns Array of InventoryResponse objects with threshold
     */
    getLowStockAlerts(params?: {
        org_id?: string;
        location_type?: LocationType;
    }): Promise<Array<InventoryResponse & {
        threshold: number;
    }>>;
}
export default Inventory;
