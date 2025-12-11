import type { ApiClientLike } from '../../types';

// Enums
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  TRANSIT = 'transit',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
}

export enum AdjustmentType {
  RECEIPT = 'receipt',
  SHIPMENT = 'shipment',
  RETURN = 'return',
  DAMAGE = 'damage',
  LOSS = 'loss',
  ADJUSTMENT = 'adjustment',
  CYCLE_COUNT = 'cycle_count',
}

// Interfaces
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

// Response Types
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

// Error Classes
export class InventoryError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class InventoryNotFoundError extends InventoryError {
  constructor(inventoryId: string) {
    super(`Inventory with ID ${inventoryId} not found`, 'InventoryNotFoundError');
  }
}

export class InsufficientInventoryError extends InventoryError {
  constructor(message: string) {
    super(message, 'InsufficientInventoryError');
  }
}

export class InventoryValidationError extends InventoryError {
  constructor(message: string) {
    super(message, 'InventoryValidationError');
  }
}

// Main Inventory Class
export class Inventory {
  constructor(private readonly client: ApiClientLike) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    const response = await this.client.request(method, path, data);
    return response.inventory || response;
  }

  private validateInventoryData(data: Partial<InventoryData>): void {
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new InventoryValidationError('Quantity cannot be negative');
    }
    if (data.minimum_quantity !== undefined && data.minimum_quantity < 0) {
      throw new InventoryValidationError('Minimum quantity cannot be negative');
    }
    if (data.maximum_quantity !== undefined && data.maximum_quantity < 0) {
      throw new InventoryValidationError('Maximum quantity cannot be negative');
    }
    if (data.reorder_point !== undefined && data.reorder_point < 0) {
      throw new InventoryValidationError('Reorder point cannot be negative');
    }
    if (data.reorder_quantity !== undefined && data.reorder_quantity < 0) {
      throw new InventoryValidationError('Reorder quantity cannot be negative');
    }
    if (data.unit_cost !== undefined && data.unit_cost < 0) {
      throw new InventoryValidationError('Unit cost cannot be negative');
    }
    if (data.unit_price !== undefined && data.unit_price < 0) {
      throw new InventoryValidationError('Unit price cannot be negative');
    }
  }

  async list(
    params: {
      status?: InventoryStatus;
      location_type?: LocationType;
      item_id?: string;
      low_stock?: boolean;
      expiring_before?: Date;
      org_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ inventory: InventoryResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request<{ inventory: InventoryResponse[]; total: number }>(
      'GET',
      `inventory?${queryParams.toString()}`
    );
  }

  async get(inventoryId: string): Promise<InventoryResponse> {
    return this.request<InventoryResponse>('GET', `inventory/${inventoryId}`);
  }

  async create(inventoryData: InventoryData): Promise<InventoryResponse> {
    this.validateInventoryData(inventoryData);
    return this.request<InventoryResponse>('POST', 'inventory', inventoryData);
  }

  async update(
    inventoryId: string,
    inventoryData: Partial<InventoryData>
  ): Promise<InventoryResponse> {
    this.validateInventoryData(inventoryData);
    return this.request<InventoryResponse>('PUT', `inventory/${inventoryId}`, inventoryData);
  }

  async delete(inventoryId: string): Promise<void> {
    await this.request<void>('DELETE', `inventory/${inventoryId}`);
  }

  async adjustQuantity(
    inventoryId: string,
    adjustment: InventoryAdjustment
  ): Promise<InventoryResponse> {
    if (adjustment.quantity === 0) {
      throw new InventoryValidationError('Adjustment quantity cannot be zero');
    }
    return this.request<InventoryResponse>('POST', `inventory/${inventoryId}/adjust`, adjustment);
  }

  async transfer(transfer: InventoryTransfer): Promise<{
    source: InventoryResponse;
    destination: InventoryResponse;
    transfer_id: string;
  }> {
    if (transfer.quantity <= 0) {
      throw new InventoryValidationError('Transfer quantity must be positive');
    }
    return this.request('POST', 'inventory/transfer', transfer);
  }

  async getHistory(
    inventoryId: string,
    params: {
      start_date?: Date;
      end_date?: Date;
      action_type?: AdjustmentType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ history: InventoryHistoryEntry[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request<{ history: InventoryHistoryEntry[]; total: number }>(
      'GET',
      `inventory/${inventoryId}/history?${queryParams.toString()}`
    );
  }

  async reserve(
    inventoryId: string,
    quantity: number,
    params: {
      order_id?: string;
      reservation_expires?: Date;
      notes?: string;
    } = {}
  ): Promise<InventoryResponse & { reservation_id: string }> {
    if (quantity <= 0) {
      throw new InventoryValidationError('Reservation quantity must be positive');
    }
    return this.request('POST', `inventory/${inventoryId}/reserve`, { quantity, ...params });
  }

  async releaseReservation(inventoryId: string, reservationId: string): Promise<InventoryResponse> {
    return this.request('POST', `inventory/${inventoryId}/release-reservation/${reservationId}`);
  }

  async getLowStockAlerts(
    params: {
      org_id?: string;
      location_type?: LocationType;
      threshold?: number;
    } = {}
  ): Promise<Array<InventoryResponse & { threshold: number }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });

    return this.request('GET', `inventory/low-stock-alerts?${queryParams.toString()}`);
  }

  async getInventoryValue(
    params: {
      org_id?: string;
      location_type?: LocationType;
      status?: InventoryStatus;
    } = {}
  ): Promise<{
    total_value: number;
    currency: string;
    breakdown: Record<string, { quantity: number; value: number }>;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });

    return this.request('GET', `inventory/value?${queryParams.toString()}`);
  }

  async bulkAdjust(
    adjustments: Array<{
      inventory_id: string;
      adjustment: InventoryAdjustment;
    }>
  ): Promise<InventoryResponse[]> {
    if (!adjustments.length) {
      throw new InventoryValidationError('At least one adjustment is required');
    }
    adjustments.forEach(({ adjustment }) => {
      if (adjustment.quantity === 0) {
        throw new InventoryValidationError('Adjustment quantity cannot be zero');
      }
    });

    return this.request('POST', 'inventory/bulk-adjust', { adjustments });
  }
}

export default Inventory;
