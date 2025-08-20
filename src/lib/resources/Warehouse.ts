import type { ApiClientLike } from '../../types';

// Enums for warehouse management
export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
  OVER_CAPACITY = 'OVER_CAPACITY',
  RESTRICTED = 'RESTRICTED'
}

export enum ZoneType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  HAZMAT = 'hazmat',
  TEMPERATURE_CONTROLLED = 'temperature_controlled',
  QUARANTINE = 'quarantine'
}

export enum StorageType {
  PALLET_RACK = 'pallet_rack',
  FLOW_RACK = 'flow_rack',
  BULK_STORAGE = 'bulk_storage',
  BIN_SHELVING = 'bin_shelving',
  DRIVE_IN_RACK = 'drive_in_rack',
  AUTOMATED_STORAGE = 'automated_storage'
}

// Interfaces for warehouse data structures
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

// Response Interface
export interface WarehouseResponse {
  id: string;
  created_at: string;
  updated_at: string;
  data: WarehouseData;
  metrics?: WarehouseMetrics;
}

// Custom Error Classes
export class WarehouseNotFoundError extends Error {
  constructor(warehouseId: string) {
    super(`Warehouse with ID ${warehouseId} not found`);
    this.name = 'WarehouseNotFoundError';
  }
}

export class WarehouseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WarehouseValidationError';
  }
}

export class InventoryOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryOperationError';
  }
}

// Main Warehouses Class
class Warehouses {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List warehouses with optional filtering
   * @param params - Filtering parameters
   * @returns Array of WarehouseResponse objects
   */
  async list(params?: {
    status?: WarehouseStatus;
    country?: string;
    state?: string;
    specialization?: string;
    org_id?: string;
  }): Promise<WarehouseResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.country) queryParams.append('country', params.country);
    if (params?.state) queryParams.append('state', params.state);
    if (params?.specialization) queryParams.append('specialization', params.specialization);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `warehouses?${queryParams.toString()}`);
    return response.warehouses;
  }

  /**
   * Get specific warehouse
   * @param warehouseId - Warehouse ID
   * @returns WarehouseResponse object
   */
  async get(warehouseId: string): Promise<WarehouseResponse> {
    try {
      const response = await this.stateset.request('GET', `warehouses/${warehouseId}`);
      return response.warehouse;
    } catch (error: any) {
      if (error.status === 404) {
        throw new WarehouseNotFoundError(warehouseId);
      }
      throw error;
    }
  }

  /**
   * Create new warehouse
   * @param warehouseData - WarehouseData object
   * @returns WarehouseResponse object
   */
  async create(warehouseData: WarehouseData): Promise<WarehouseResponse> {
    this.validateWarehouseData(warehouseData);

    try {
      const response = await this.stateset.request('POST', 'warehouses', warehouseData);
      return response.warehouse;
    } catch (error: any) {
      if (error.status === 400) {
        throw new WarehouseValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update warehouse
   * @param warehouseId - Warehouse ID
   * @param warehouseData - Partial<WarehouseData> object
   * @returns WarehouseResponse object
   */
  async update(
    warehouseId: string,
    warehouseData: Partial<WarehouseData>
  ): Promise<WarehouseResponse> {
    try {
      const response = await this.stateset.request('PUT', `warehouses/${warehouseId}`, warehouseData);
      return response.warehouse;
    } catch (error: any) {
      if (error.status === 404) {
        throw new WarehouseNotFoundError(warehouseId);
      }
      throw error;
    }
  }

  /**
   * Delete warehouse
   * @param warehouseId - Warehouse ID
   */
  async delete(warehouseId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `warehouses/${warehouseId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new WarehouseNotFoundError(warehouseId);
      }
      throw error;
    }
  }

  /**
   * Inventory management methods
   * @param warehouseId - Warehouse ID
   * @param params - Filtering parameters
   * @returns Array of InventoryItem objects
   */
  async getInventory(
    warehouseId: string,
    params?: {
      zone_id?: string;
      status?: string;
      below_reorder_point?: boolean;
    }
  ): Promise<InventoryItem[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.zone_id) queryParams.append('zone_id', params.zone_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.below_reorder_point !== undefined) {
      queryParams.append('below_reorder_point', params.below_reorder_point.toString());
    }

    const response = await this.stateset.request(
      'GET',
      `warehouses/${warehouseId}/inventory?${queryParams.toString()}`
    );
    return response.inventory;
  }

  /**
   * Zone management methods
   * @param warehouseId - Warehouse ID
   * @param zoneData - Zone object
   * @returns WarehouseResponse object
   */
  async addZone(
    warehouseId: string,
    zoneData: Zone
  ): Promise<WarehouseResponse> {
    const response = await this.stateset.request(
      'POST',
      `warehouses/${warehouseId}/zones`,
      zoneData
    );
    return response.warehouse;
  }

  /**
   * Equipment management methods
   * @param warehouseId - Warehouse ID
   * @param equipmentId - Equipment ID
   * @param status - Equipment status
   * @returns Equipment object
   */
  async updateEquipmentStatus(
    warehouseId: string,
    equipmentId: string,
    status: string
  ): Promise<Equipment> {
    const response = await this.stateset.request(
      'PUT',
      `warehouses/${warehouseId}/equipment/${equipmentId}/status`,
      { status }
    );
    return response.equipment;
  }

  /**
   * Staff management methods
   * @param warehouseId - Warehouse ID
   * @param staffId - Staff ID
   * @param zoneId - Zone ID
   * @returns StaffMember object
   */
  async assignStaffToZone(
    warehouseId: string,
    staffId: string,
    zoneId: string
  ): Promise<StaffMember> {
    const response = await this.stateset.request(
      'POST',
      `warehouses/${warehouseId}/staff/${staffId}/assign`,
      { zone_id: zoneId }
    );
    return response.staff_member;
  }

  /**
   * Metrics and reporting
   * @param warehouseId - Warehouse ID
   * @param params - Filtering parameters
   * @returns WarehouseMetrics object
   */
  async getMetrics(
    warehouseId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<WarehouseMetrics> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());

    const response = await this.stateset.request(
      'GET',
      `warehouses/${warehouseId}/metrics?${queryParams.toString()}`
    );
    return response.metrics;
  }

  /**
   * Validate warehouse data
   * @param data - WarehouseData object
   */
  private validateWarehouseData(data: WarehouseData): void {
    if (!data.name) {
      throw new WarehouseValidationError('Warehouse name is required');
    }

    if (!data.location || !data.location.address) {
      throw new WarehouseValidationError('Warehouse location is required');
    }

    if (!data.total_capacity || !data.total_capacity.value) {
      throw new WarehouseValidationError('Warehouse capacity is required');
    }

    if (data.zones) {
      const zoneIds = new Set();
      for (const zone of data.zones) {
        if (zoneIds.has(zone.id)) {
          throw new WarehouseValidationError(`Duplicate zone ID: ${zone.id}`);
        }
        zoneIds.add(zone.id);
      }
    }
  }
}

export default Warehouses;