import { stateset } from '../../stateset-client';
export declare enum WarehouseStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    MAINTENANCE = "MAINTENANCE",
    CLOSED = "CLOSED",
    OVER_CAPACITY = "OVER_CAPACITY",
    RESTRICTED = "RESTRICTED"
}
export declare enum ZoneType {
    RECEIVING = "receiving",
    STORAGE = "storage",
    PICKING = "picking",
    PACKING = "packing",
    SHIPPING = "shipping",
    RETURNS = "returns",
    HAZMAT = "hazmat",
    TEMPERATURE_CONTROLLED = "temperature_controlled",
    QUARANTINE = "quarantine"
}
export declare enum StorageType {
    PALLET_RACK = "pallet_rack",
    FLOW_RACK = "flow_rack",
    BULK_STORAGE = "bulk_storage",
    BIN_SHELVING = "bin_shelving",
    DRIVE_IN_RACK = "drive_in_rack",
    AUTOMATED_STORAGE = "automated_storage"
}
export interface WarehouseLocation {
    address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    timezone: string;
    business_hours: Array<{
        day: string;
        open: string;
        close: string;
    }>;
}
export interface Zone {
    id: string;
    name: string;
    type: ZoneType;
    capacity: {
        total_space: number;
        available_space: number;
        units: string;
    };
    storage_type: StorageType;
    temperature_range?: {
        min: number;
        max: number;
        unit: 'C' | 'F';
    };
    accessibility_rules?: {
        requires_certification: boolean;
        restricted_access: boolean;
        special_equipment_needed: boolean;
    };
    layout?: {
        aisles: number;
        sections: number;
        levels: number;
    };
}
export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    quantity: number;
    minimum_quantity: number;
    reorder_point: number;
    unit_of_measure: string;
    location: {
        zone_id: string;
        aisle: string;
        section: string;
        level: string;
        position: string;
    };
    batch_info?: {
        batch_number: string;
        manufacture_date: string;
        expiry_date: string;
        lot_number: string;
    };
    status: 'available' | 'reserved' | 'damaged' | 'quarantine';
    last_counted: string;
    value_per_unit: number;
    total_value: number;
    handling_instructions?: string[];
}
export interface Equipment {
    id: string;
    type: string;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
    last_maintenance: string;
    next_maintenance: string;
    capacity?: number;
    assigned_to?: string;
    location?: {
        zone_id: string;
        position: string;
    };
}
export interface StaffMember {
    id: string;
    name: string;
    role: string;
    certifications: string[];
    assigned_zones: string[];
    shifts: Array<{
        day: string;
        start: string;
        end: string;
    }>;
    specializations?: string[];
}
export interface WarehouseMetrics {
    capacity_utilization: number;
    inventory_accuracy: number;
    order_fulfillment_rate: number;
    picking_accuracy: number;
    receiving_accuracy: number;
    shipping_accuracy: number;
    labor_efficiency: number;
    equipment_utilization: number;
    inventory_turnover: number;
    average_storage_time: number;
}
export interface WarehouseConfig {
    operating_hours: {
        timezone: string;
        schedule: Array<{
            day: string;
            shifts: Array<{
                start: string;
                end: string;
                type: string;
            }>;
        }>;
    };
    security_settings: {
        access_control: boolean;
        surveillance: boolean;
        alarm_system: boolean;
        restricted_areas: string[];
    };
    safety_protocols: {
        emergency_contacts: string[];
        evacuation_routes: string[];
        safety_equipment_locations: Record<string, string[]>;
    };
    automation_settings?: {
        automated_systems: string[];
        integration_points: string[];
        robot_zones: string[];
    };
}
export interface WarehouseData {
    name: string;
    code: string;
    location: WarehouseLocation;
    status: WarehouseStatus;
    total_capacity: {
        value: number;
        unit: string;
    };
    zones: Zone[];
    equipment: Equipment[];
    staff: StaffMember[];
    config: WarehouseConfig;
    certifications?: string[];
    specializations?: string[];
    org_id?: string;
}
export interface WarehouseResponse {
    id: string;
    created_at: string;
    updated_at: string;
    data: WarehouseData;
    metrics?: WarehouseMetrics;
}
export declare class WarehouseNotFoundError extends Error {
    constructor(warehouseId: string);
}
export declare class WarehouseValidationError extends Error {
    constructor(message: string);
}
export declare class InventoryOperationError extends Error {
    constructor(message: string);
}
declare class Warehouses {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List warehouses with optional filtering
     */
    list(params?: {
        status?: WarehouseStatus;
        country?: string;
        state?: string;
        specialization?: string;
        org_id?: string;
    }): Promise<WarehouseResponse[]>;
    /**
     * Get specific warehouse
     */
    get(warehouseId: string): Promise<WarehouseResponse>;
    /**
     * Create new warehouse
     */
    create(warehouseData: WarehouseData): Promise<WarehouseResponse>;
    /**
     * Update warehouse
     */
    update(warehouseId: string, warehouseData: Partial<WarehouseData>): Promise<WarehouseResponse>;
    /**
     * Delete warehouse
     */
    delete(warehouseId: string): Promise<void>;
    /**
     * Inventory management methods
     */
    getInventory(warehouseId: string, params?: {
        zone_id?: string;
        status?: string;
        below_reorder_point?: boolean;
    }): Promise<InventoryItem[]>;
    /**
     * Zone management methods
     */
    addZone(warehouseId: string, zoneData: Zone): Promise<WarehouseResponse>;
    /**
     * Equipment management methods
     */
    updateEquipmentStatus(warehouseId: string, equipmentId: string, status: string): Promise<Equipment>;
    /**
     * Staff management methods
     */
    assignStaffToZone(warehouseId: string, staffId: string, zoneId: string): Promise<StaffMember>;
    /**
     * Metrics and reporting
     */
    getMetrics(warehouseId: string, params?: {
        start_date?: Date;
        end_date?: Date;
    }): Promise<WarehouseMetrics>;
    /**
     * Validate warehouse data
     */
    private validateWarehouseData;
}
export default Warehouses;
