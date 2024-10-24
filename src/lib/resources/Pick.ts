import { stateset } from '../../stateset-client';

// Enums for pick management
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
  SINGLE_ORDER = 'single_order',
  BATCH = 'batch',
  ZONE = 'zone',
  WAVE = 'wave',
  CLUSTER = 'cluster'
}

export enum PickPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum PickMethod {
  DISCRETE = 'discrete',
  BATCH = 'batch',
  ZONE = 'zone',
  WAVE = 'wave',
  CLUSTER = 'cluster'
}

// Interfaces for pick data structures
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

// Response Interface
export interface PickResponse {
  id: string;
  created_at: string;
  updated_at: string;
  status: PickStatus;
  data: PickData;
}

// Custom Error Classes
export class PickNotFoundError extends Error {
  constructor(pickId: string) {
    super(`Pick with ID ${pickId} not found`);
    this.name = 'PickNotFoundError';
  }
}

export class PickValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PickValidationError';
  }
}

export class PickOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PickOperationError';
  }
}

// Main Picks Class
class Picks {
  constructor(private readonly stateset: stateset) {}

  /**
   * List picks with optional filtering
   */
  async list(params?: {
    status?: PickStatus;
    type?: PickType;
    priority?: PickPriority;
    warehouse_id?: string;
    picker_id?: string;
    batch_id?: string;
    wave_id?: string;
    org_id?: string;
  }): Promise<PickResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params?.picker_id) queryParams.append('picker_id', params.picker_id);
    if (params?.batch_id) queryParams.append('batch_id', params.batch_id);
    if (params?.wave_id) queryParams.append('wave_id', params.wave_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `picks?${queryParams.toString()}`);
    return response.picks;
  }

  /**
   * Get specific pick
   */
  async get(pickId: string): Promise<PickResponse> {
    try {
      const response = await this.stateset.request('GET', `picks/${pickId}`);
      return response.pick;
    } catch (error: any) {
      if (error.status === 404) {
        throw new PickNotFoundError(pickId);
      }
      throw error;
    }
  }

  /**
   * Create new pick
   */
  async create(pickData: PickData): Promise<PickResponse> {
    this.validatePickData(pickData);

    try {
      const response = await this.stateset.request('POST', 'picks', pickData);
      return response.pick;
    } catch (error: any) {
      if (error.status === 400) {
        throw new PickValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update pick
   */
  async update(
    pickId: string,
    pickData: Partial<PickData>
  ): Promise<PickResponse> {
    try {
      const response = await this.stateset.request('PUT', `picks/${pickId}`, pickData);
      return response.pick;
    } catch (error: any) {
      if (error.status === 404) {
        throw new PickNotFoundError(pickId);
      }
      throw error;
    }
  }

  /**
   * Delete pick
   */
  async delete(pickId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `picks/${pickId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new PickNotFoundError(pickId);
      }
      throw error;
    }
  }

  /**
   * Optimize pick route
   */
  async optimizeRoute(
    pickId: string,
    params?: {
      algorithm?: 'shortest_path' | 'nearest_neighbor' | 'genetic';
      constraints?: {
        max_distance?: number;
        max_time?: number;
        zone_restrictions?: string[];
      };
    }
  ): Promise<PickRoute> {
    const response = await this.stateset.request(
      'POST',
      `picks/${pickId}/optimize-route`,
      params
    );
    return response.route;
  }

  /**
   * Start pick operation
   */
  async start(
    pickId: string,
    startData: {
      picker_id: string;
      equipment_id?: string;
    }
  ): Promise<PickResponse> {
    const response = await this.stateset.request('POST', `picks/${pickId}/start`, startData);
    return response.pick;
  }

  /**
   * Record item pick
   */
  async recordItemPick(
    pickId: string,
    itemData: {
      item_id: string;
      quantity_picked: number;
      location?: PickLocation;
      batch_number?: string;
      notes?: string[];
    }
  ): Promise<PickResponse> {
    const response = await this.stateset.request(
      'POST',
      `picks/${pickId}/items/${itemData.item_id}/pick`,
      itemData
    );
    return response.pick;
  }

  /**
   * Complete quality check
   */
  async completeQualityCheck(
    pickId: string,
    checkData: QualityCheck
  ): Promise<PickResponse> {
    const response = await this.stateset.request(
      'POST',
      `picks/${pickId}/quality-check`,
      checkData
    );
    return response.pick;
  }

  /**
   * Complete pick
   */
  async complete(
    pickId: string,
    completionData: {
      end_time: string;
      final_metrics?: Partial<PickMetrics>;
      notes?: string[];
    }
  ): Promise<PickResponse> {
    const response = await this.stateset.request(
      'POST',
      `picks/${pickId}/complete`,
      completionData
    );
    return response.pick;
  }

  /**
   * Get pick metrics
   */
  async getMetrics(pickId: string): Promise<PickMetrics> {
    const response = await this.stateset.request('GET', `picks/${pickId}/metrics`);
    return response.metrics;
  }

  /**
   * Validate pick data
   */
  private validatePickData(data: PickData): void {
    if (!data.warehouse_id) {
      throw new PickValidationError('Warehouse ID is required');
    }

    if (!data.items || data.items.length === 0) {
      throw new PickValidationError('At least one pick item is required');
    }

    if (data.type === PickType.BATCH && !data.batch_id) {
      throw new PickValidationError('Batch ID is required for batch picks');
    }

    if (data.type === PickType.WAVE && !data.wave_id) {
      throw new PickValidationError('Wave ID is required for wave picks');
    }

    for (const item of data.items) {
      if (item.quantity_requested <= 0) {
        throw new PickValidationError('Item quantity must be greater than 0');
      }
      if (!item.location) {
        throw new PickValidationError('Item location is required');
      }
    }
  }
}

export default Picks;