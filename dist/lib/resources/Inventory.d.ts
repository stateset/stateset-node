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
    id: string;
    timestamp: string;
    action: string;
    quantity_before: number;
    quantity_after: number;
    adjustment?: InventoryAdjustment;
    transfer?: InventoryTransfer;
    performed_by: string;
}
export declare class InventoryError extends Error {
    constructor(message: string, name: string);
}
export declare class InventoryNotFoundError extends InventoryError {
    constructor(inventoryId: string);
}
export declare class InsufficientInventoryError extends InventoryError {
    constructor(message: string);
}
export declare class InventoryValidationError extends InventoryError {
    constructor(message: string);
}
export declare class Inventory {
    private readonly client;
    constructor(client: stateset);
    private request;
    private validateInventoryData;
    list(params?: {
        status?: InventoryStatus;
        location_type?: LocationType;
        item_id?: string;
        low_stock?: boolean;
        expiring_before?: Date;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        inventory: InventoryResponse[];
        total: number;
    }>;
    get(inventoryId: string): Promise<InventoryResponse>;
    create(inventoryData: InventoryData): Promise<InventoryResponse>;
    update(inventoryId: string, inventoryData: Partial<InventoryData>): Promise<InventoryResponse>;
    delete(inventoryId: string): Promise<void>;
    adjustQuantity(inventoryId: string, adjustment: InventoryAdjustment): Promise<InventoryResponse>;
    transfer(transfer: InventoryTransfer): Promise<{
        source: InventoryResponse;
        destination: InventoryResponse;
        transfer_id: string;
    }>;
    getHistory(inventoryId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        action_type?: AdjustmentType;
        limit?: number;
        offset?: number;
    }): Promise<{
        history: InventoryHistoryEntry[];
        total: number;
    }>;
    reserve(inventoryId: string, quantity: number, params?: {
        order_id?: string;
        reservation_expires?: Date;
        notes?: string;
    }): Promise<InventoryResponse & {
        reservation_id: string;
    }>;
    releaseReservation(inventoryId: string, reservationId: string): Promise<InventoryResponse>;
    getLowStockAlerts(params?: {
        org_id?: string;
        location_type?: LocationType;
        threshold?: number;
    }): Promise<Array<InventoryResponse & {
        threshold: number;
    }>>;
    getInventoryValue(params?: {
        org_id?: string;
        location_type?: LocationType;
        status?: InventoryStatus;
    }): Promise<{
        total_value: number;
        currency: string;
        breakdown: Record<string, {
            quantity: number;
            value: number;
        }>;
    }>;
    bulkAdjust(adjustments: Array<{
        inventory_id: string;
        adjustment: InventoryAdjustment;
    }>): Promise<InventoryResponse[]>;
}
export default Inventory;
//# sourceMappingURL=Inventory.d.ts.map