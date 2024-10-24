import { stateset } from '../../stateset-client';

// Enums for inventory management
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  DAMAGED = 'damaged'
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  TRANSIT = 'transit',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer'
}

export enum AdjustmentType {
  RECEIPT = 'receipt',
  SHIPMENT = 'shipment',
  RETURN = 'return',
  DAMAGE = 'damage',
  LOSS = 'loss',
  ADJUSTMENT = 'adjustment',
  CYCLE_COUNT = 'cycle_count'
}

// Interfaces for inventory data structures
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

// Response Interfaces
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

// Custom Error Classes
export class InventoryNotFoundError extends Error {
  constructor(inventoryId: string) {
    super(`Inventory with ID ${inventoryId} not found`);
    this.name = 'InventoryNotFoundError';
  }
}

export class InsufficientInventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientInventoryError';
  }
}

export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryValidationError';
  }
}

// Main Inventory Class
class Inventory {
  constructor(private readonly stateset: stateset) {}

  /**
   * Validates inventory quantities and thresholds
   */
  private validateInventoryData(data: Partial<InventoryData>): void {
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new InventoryValidationError('Quantity cannot be negative');
    }

    if (data.minimum_quantity !== undefined && data.maximum_quantity !== undefined) {
      if (data.minimum_quantity > data.maximum_quantity) {
        throw new InventoryValidationError('Minimum quantity cannot be greater than maximum quantity');
      }
    }

    if (data.reorder_point !== undefined && data.reorder_quantity !== undefined) {
      if (data.reorder_point > data.reorder_quantity) {
        throw new InventoryValidationError('Reorder point cannot be greater than reorder quantity');
      }
    }
  }

  /**
   * List inventory with optional filtering
   */
  async list(params?: {
    status?: InventoryStatus;
    location_type?: LocationType;
    low_stock?: boolean;
    expiring_before?: Date;
    org_id?: string;
  }): Promise<InventoryResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.location_type) queryParams.append('location_type', params.location_type);
    if (params?.low_stock !== undefined) queryParams.append('low_stock', params.low_stock.toString());
    if (params?.expiring_before) queryParams.append('expiring_before', params.expiring_before.toISOString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `inventory?${queryParams.toString()}`);
    return response.inventory;
  }

  /**
   * Get specific inventory by ID
   */
  async get(inventoryId: string): Promise<InventoryResponse> {
    try {
      const response = await this.stateset.request('GET', `inventory/${inventoryId}`);
      return response.inventory;
    } catch (error: any) {
      if (error.status === 404) {
        throw new InventoryNotFoundError(inventoryId);
      }
      throw error;
    }
  }

  /**
   * Create new inventory
   */
  async create(inventoryData: InventoryData): Promise<InventoryResponse> {
    this.validateInventoryData(inventoryData);
    const response = await this.stateset.request('POST', 'inventory', inventoryData);
    return response.inventory;
  }

  /**
   * Update existing inventory
   */
  async update(inventoryId: string, inventoryData: Partial<InventoryData>): Promise<InventoryResponse> {
    this.validateInventoryData(inventoryData);
    try {
      const response = await this.stateset.request('PUT', `inventory/${inventoryId}`, inventoryData);
      return response.inventory;
    } catch (error: any) {
      if (error.status === 404) {
        throw new InventoryNotFoundError(inventoryId);
      }
      throw error;
    }
  }

  /**
   * Delete inventory
   */
  async delete(inventoryId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `inventory/${inventoryId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new InventoryNotFoundError(inventoryId);
      }
      throw error;
    }
  }

  /**
   * Adjust inventory quantity
   */
  async adjustQuantity(
    inventoryId: string, 
    adjustment: InventoryAdjustment
  ): Promise<InventoryResponse> {
    if (adjustment.quantity === 0) {
      throw new InventoryValidationError('Adjustment quantity cannot be zero');
    }

    try {
      const response = await this.stateset.request(
        'POST', 
        `inventory/${inventoryId}/adjust`, 
        adjustment
      );
      return response.inventory;
    } catch (error: any) {
      if (error.status === 400 && error.code === 'INSUFFICIENT_QUANTITY') {
        throw new InsufficientInventoryError(error.message);
      }
      throw error;
    }
  }

  /**
   * Transfer inventory between locations
   */
  async transfer(transfer: InventoryTransfer): Promise<{
    source: InventoryResponse;
    destination: InventoryResponse;
    transfer_id: string;
  }> {
    if (transfer.quantity <= 0) {
      throw new InventoryValidationError('Transfer quantity must be positive');
    }

    const response = await this.stateset.request('POST', 'inventory/transfer', transfer);
    return {
      source: response.source_inventory,
      destination: response.destination_inventory,
      transfer_id: response.transfer_id
    };
  }

  /**
   * Get inventory history
   */
  async getHistory(
    inventoryId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      action_type?: AdjustmentType;
      limit?: number;
    }
  ): Promise<InventoryHistoryEntry[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.action_type) queryParams.append('action_type', params.action_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `inventory/${inventoryId}/history?${queryParams.toString()}`
    );
    return response.history;
  }

  /**
   * Reserve inventory
   */
  async reserve(
    inventoryId: string,
    quantity: number,
    params: {
      order_id?: string;
      reservation_expires?: Date;
      notes?: string;
    } = {}
  ): Promise<InventoryResponse> {
    const response = await this.stateset.request('POST', `inventory/${inventoryId}/reserve`, {
      quantity,
      ...params
    });
    return response.inventory;
  }

  /**
   * Release reserved inventory
   */
  async releaseReservation(
    inventoryId: string,
    reservationId: string
  ): Promise<InventoryResponse> {
    const response = await this.stateset.request(
      'POST',
      `inventory/${inventoryId}/release-reservation/${reservationId}`
    );
    return response.inventory;
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(params?: {
    org_id?: string;
    location_type?: LocationType;
  }): Promise<Array<InventoryResponse & { threshold: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.location_type) queryParams.append('location_type', params.location_type);

    const response = await this.stateset.request(
      'GET',
      `inventory/low-stock-alerts?${queryParams.toString()}`
    );
    return response.alerts;
  }
}

export default Inventory;