import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums with consistent naming
export enum PickStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  QUALITY_CHECK = 'QUALITY_CHECK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PickType {
  SINGLE_ORDER = 'SINGLE_ORDER',
  BATCH = 'BATCH',
  ZONE = 'ZONE',
  WAVE = 'WAVE',
  CLUSTER = 'CLUSTER'
}

export enum PickPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export enum PickMethod {
  DISCRETE = 'DISCRETE',
  BATCH = 'BATCH',
  ZONE = 'ZONE',
  WAVE = 'WAVE',
  CLUSTER = 'CLUSTER'
}

// Core Interfaces
export interface PickLocation {
  zone_id: NonEmptyString<string>;
  aisle: NonEmptyString<string>;
  rack: NonEmptyString<string>;
  shelf: NonEmptyString<string>;
  bin: NonEmptyString<string>;
  sequence_number: number;
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
}

export interface PickItem {
  item_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  product_name: NonEmptyString<string>;
  quantity: {
    requested: number;
    picked: number;
    available: number;
  };
  unit_of_measure: NonEmptyString<string>;
  location: PickLocation;
  batch_number?: string;
  lot_number?: string;
  expiration_date?: Timestamp;
  substitutions: {
    allowed: boolean;
    items?: NonEmptyString<string>[];
    used?: NonEmptyString<string>;
  };
  status: 'PENDING' | 'PICKED' | 'PARTIAL' | 'SUBSTITUTED' | 'UNAVAILABLE';
  notes?: string[];
  serial_numbers?: string[];
}

export interface PickerAssignment {
  picker_id: NonEmptyString<string>;
  name: NonEmptyString<string>;
  assigned_at: Timestamp;
  equipment?: {
    id: string;
    type: string;
  };
  restrictions?: {
    zones?: string[];
    weight_limit?: number;
  };
  certifications?: string[];
  status: 'ACTIVE' | 'UNAVAILABLE' | 'ON_BREAK';
}

export interface PickRoute {
  sequence: PickLocation[];
  optimization: {
    distance: number; // in meters
    time: number;    // in minutes
    algorithm: 'SHORTEST_PATH' | 'NEAREST_NEIGHBOR' | 'GENETIC';
  };
  zones?: string[];
  requirements?: {
    equipment: string[];
    instructions: string[];
  };
}

export interface QualityCheck {
  checker_id: NonEmptyString<string>;
  checked_at: Timestamp;
  items: Array<{
    item_id: NonEmptyString<string>;
    passed: boolean;
    issues?: string[];
    notes?: string;
  }>;
  status: 'PASSED' | 'FAILED' | 'PARTIAL';
  resolution?: {
    action: 'RETURN' | 'REPROCESS' | 'APPROVE';
    timestamp: Timestamp;
  };
}

export interface PickMetrics {
  items: {
    total: number;
    picked: number;
    accuracy: number; // percentage
  };
  quantity: {
    total: number;
    picked: number;
  };
  performance: {
    completion_rate: number; // percentage
    time: number;          // in minutes
    distance: number;      // in meters
    picks_per_hour: number;
  };
  timestamp: Timestamp;
}

export interface PickData {
  order_ids: NonEmptyString<string>[];
  warehouse_id: NonEmptyString<string>;
  type: PickType;
  priority: PickPriority;
  method: PickMethod;
  items: PickItem[];
  assignment?: PickerAssignment;
  route?: PickRoute;
  schedule: {
    due?: Timestamp;
    started?: Timestamp;
    completed?: Timestamp;
  };
  quality?: QualityCheck;
  metrics?: PickMetrics;
  grouping?: {
    batch_id?: string;
    wave_id?: string;
  };
  instructions?: string[];
  org_id?: string;
  tags?: string[];
}

// Response Type with Discriminated Union
export type PickResponse = {
  id: NonEmptyString<string>;
  created_at: Timestamp;
  updated_at: Timestamp;
  status: PickStatus;
  data: PickData;
} & (
  | { status: PickStatus.DRAFT | PickStatus.PENDING }
  | { status: PickStatus.ASSIGNED; assignment: PickerAssignment }
  | { status: PickStatus.IN_PROGRESS; progress: { started_at: Timestamp; completed_items: number } }
  | { status: PickStatus.ON_HOLD; hold_reason: string }
  | { status: PickStatus.QUALITY_CHECK; quality: QualityCheck }
  | { status: PickStatus.COMPLETED; metrics: PickMetrics }
  | { status: PickStatus.CANCELLED; cancellation_reason?: string }
);

// Error Classes
export class PickError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PickNotFoundError extends PickError {
  constructor(pickId: string) {
    super(`Pick with ID ${pickId} not found`, { pickId });
  }
}

export class PickValidationError extends PickError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export class PickOperationError extends PickError {
  constructor(message: string, public readonly operation?: string) {
    super(message);
  }
}

// Main Picks Class
export class Picks {
  constructor(private readonly client: ApiClientLike) {}

  private validatePickData(data: PickData): void {
    if (!data.warehouse_id) throw new PickValidationError('Warehouse ID is required');
    if (!data.items?.length) throw new PickValidationError('At least one pick item is required');
    
    if (data.type === PickType.BATCH && !data.grouping?.batch_id) {
      throw new PickValidationError('Batch ID required for batch picks');
    }
    if (data.type === PickType.WAVE && !data.grouping?.wave_id) {
      throw new PickValidationError('Wave ID required for wave picks');
    }

    data.items.forEach((item, index) => {
      if (item.quantity.requested <= 0) {
        throw new PickValidationError(`Item[${index}] quantity must be greater than 0`);
      }
      if (!item.location) {
        throw new PickValidationError(`Item[${index}] location is required`);
      }
    });
  }

  async list(params: {
    status?: PickStatus;
    type?: PickType;
    priority?: PickPriority;
    warehouse_id?: string;
    picker_id?: string;
    batch_id?: string;
    wave_id?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    picks: PickResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.priority && { priority: params.priority }),
      ...(params.warehouse_id && { warehouse_id: params.warehouse_id }),
      ...(params.picker_id && { picker_id: params.picker_id }),
      ...(params.batch_id && { batch_id: params.batch_id }),
      ...(params.wave_id && { wave_id: params.wave_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await this.client.request('GET', `picks?${query}`);
    return response;
  }

  async get(pickId: NonEmptyString<string>): Promise<PickResponse> {
    try {
      const response = await this.client.request('GET', `picks/${pickId}`);
      return response.pick;
    } catch (error: any) {
      throw this.handleError(error, 'get', pickId);
    }
  }

  async create(data: PickData): Promise<PickResponse> {
    this.validatePickData(data);
    try {
      const response = await this.client.request('POST', 'picks', data);
      return response.pick;
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(pickId: NonEmptyString<string>, data: Partial<PickData>): Promise<PickResponse> {
    try {
      const response = await this.client.request('PUT', `picks/${pickId}`, data);
      return response.pick;
    } catch (error: any) {
      throw this.handleError(error, 'update', pickId);
    }
  }

  async delete(pickId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `picks/${pickId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', pickId);
    }
  }

  async optimizeRoute(
    pickId: NonEmptyString<string>,
    params: {
      algorithm?: 'SHORTEST_PATH' | 'NEAREST_NEIGHBOR' | 'GENETIC';
      constraints?: {
        max_distance?: number;
        max_time?: number;
        zone_restrictions?: string[];
        picker_capabilities?: string[];
      };
    } = {}
  ): Promise<PickRoute> {
    const response = await this.client.request('POST', `picks/${pickId}/optimize-route`, params);
    return response.route;
  }

  async start(
    pickId: NonEmptyString<string>,
    data: {
      picker_id: NonEmptyString<string>;
      equipment_id?: string;
      start_time?: Timestamp;
    }
  ): Promise<PickResponse> {
    const response = await this.client.request('POST', `picks/${pickId}/start`, data);
    return response.pick;
  }

  async recordItemPick(
    pickId: NonEmptyString<string>,
    itemData: {
      item_id: NonEmptyString<string>;
      quantity_picked: number;
      location?: PickLocation;
      batch_number?: string;
      serial_numbers?: string[];
      notes?: string[];
      substituted_item_id?: string;
    }
  ): Promise<PickResponse> {
    const response = await this.client.request(
      'POST',
      `picks/${pickId}/items/${itemData.item_id}/pick`,
      itemData
    );
    return response.pick;
  }

  async completeQualityCheck(
    pickId: NonEmptyString<string>,
    checkData: QualityCheck
  ): Promise<PickResponse> {
    const response = await this.client.request('POST', `picks/${pickId}/quality-check`, checkData);
    return response.pick;
  }

  async complete(
    pickId: NonEmptyString<string>,
    data: {
      end_time: Timestamp;
      metrics?: Partial<PickMetrics>;
      notes?: string[];
    }
  ): Promise<PickResponse> {
    const response = await this.client.request('POST', `picks/${pickId}/complete`, data);
    return response.pick;
  }

  async getMetrics(pickId: NonEmptyString<string>): Promise<PickMetrics> {
    const response = await this.client.request('GET', `picks/${pickId}/metrics`);
    return response.metrics;
  }

  private handleError(error: any, operation: string, pickId?: string): never {
    if (error.status === 404) throw new PickNotFoundError(pickId || 'unknown');
    if (error.status === 400) throw new PickValidationError(error.message, error.errors);
    throw new PickOperationError(
      `Failed to ${operation} pick: ${error.message}`,
      operation
    );
  }
}

export default Picks;