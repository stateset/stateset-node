import { stateset } from '../../stateset-client';

// Constants
const DEFAULT_CURRENCY = 'USD';

// Enums
export enum ManufacturerOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  QUALITY_CHECK = 'QUALITY_CHECK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export enum ProductionPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum QualityCheckStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL = 'conditional'
}

// Base Interfaces
interface Metadata {
  [key: string]: any;
}

interface ProductionMilestones {
  materials_ready?: string;
  production_start?: string;
  quality_check?: string;
  packaging_start?: string;
  shipping_ready?: string;
}

// Core Data Structures
export interface ProductionShift {
  shift_id: string;
  start_time: string;
  end_time: string;
  machine_id?: string;
  operator_id?: string;
}

export interface ProductionSchedule {
  start_date: string;
  end_date: string;
  shifts: ProductionShift[];
  milestone_dates: ProductionMilestones;
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
  metadata?: Metadata;
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

// Response Types
interface BaseManufacturerOrderResponse {
  id: string;
  object: 'manufacturerorder';
  created_at: string;
  updated_at: string;
  status: ManufacturerOrderStatus;
  data: ManufacturerOrderData;
}

export type ManufacturerOrderResponse = BaseManufacturerOrderResponse & {
  [K in ManufacturerOrderStatus]: {
    status: K;
  } & (K extends ManufacturerOrderStatus.IN_PRODUCTION ? { inProduction: true; production_updates: ProductionUpdate[] }
    : K extends ManufacturerOrderStatus.QUALITY_CHECK ? { qualityCheck: true; quality_results?: QualityCheckResult }
    : K extends ManufacturerOrderStatus.COMPLETED ? { completed: true; final_costs: ProductionCosts; quality_results: QualityCheckResult }
    : K extends ManufacturerOrderStatus.CANCELLED ? { cancelled: true; cancellation_reason: string; cancellation_costs?: ProductionCosts }
    : {});
}[ManufacturerOrderStatus];

// Custom Error Classes
export class ManufacturerOrderError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class ManufacturerOrderNotFoundError extends ManufacturerOrderError {
  constructor(orderId: string) {
    super(`Manufacturer order with ID ${orderId} not found`, 'ManufacturerOrderNotFoundError');
  }
}

export class ManufacturerOrderStateError extends ManufacturerOrderError {
  constructor(message: string) {
    super(message, 'ManufacturerOrderStateError');
  }
}

export class MaterialRequirementError extends ManufacturerOrderError {
  constructor(message: string) {
    super(message, 'MaterialRequirementError');
  }
}

// Utility Functions
const validateMaterials = (materials: MaterialRequirement[]): void => {
  materials.forEach(material => {
    if (material.quantity <= 0) {
      throw new MaterialRequirementError(
        `Invalid quantity ${material.quantity} for material ${material.material_id}`
      );
    }
  });
};

// Main ManufacturerOrders Class
export class ManufacturerOrders {
  constructor(private readonly client: stateset) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    try {
      return await this.client.request(method, path, data);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ManufacturerOrderNotFoundError(path.split('/')[2] || 'unknown');
      }
      if (error.status === 400) {
        throw new MaterialRequirementError(error.message);
      }
      throw error;
    }
  }

  async list(params: {
    status?: ManufacturerOrderStatus;
    manufacturer_id?: string;
    product_id?: string;
    priority?: ProductionPriority;
    from_date?: Date;
    to_date?: Date;
    org_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ orders: ManufacturerOrderResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request<{ orders: ManufacturerOrderResponse[]; total: number }>(
      'GET',
      `manufacturerorders?${queryParams.toString()}`
    );
  }

  async get(orderId: string): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>('GET', `manufacturerorders/${orderId}`);
  }

  async create(orderData: ManufacturerOrderData): Promise<ManufacturerOrderResponse> {
    validateMaterials(orderData.material_requirements);
    return this.request<ManufacturerOrderResponse>('POST', 'manufacturerorders', {
      ...orderData,
      estimated_costs: orderData.estimated_costs && {
        ...orderData.estimated_costs,
        currency: orderData.estimated_costs.currency || DEFAULT_CURRENCY
      }
    });
  }

  async update(orderId: string, orderData: Partial<ManufacturerOrderData>): Promise<ManufacturerOrderResponse> {
    if (orderData.material_requirements) {
      validateMaterials(orderData.material_requirements);
    }
    return this.request<ManufacturerOrderResponse>('PUT', `manufacturerorders/${orderId}`, orderData);
  }

  async delete(orderId: string): Promise<void> {
    await this.request<void>('DELETE', `manufacturerorders/${orderId}`);
  }

  // Status Management
  async submit(orderId: string): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>('POST', `manufacturerorders/${orderId}/submit`);
  }

  async startProduction(
    orderId: string,
    startData: {
      machine_id?: string;
      operator_id?: string;
      start_notes?: string;
    } = {}
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/start-production`,
      startData
    );
  }

  async submitQualityCheck(
    orderId: string,
    qualityData: QualityCheckResult
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/quality-check`,
      qualityData
    );
  }

  async complete(
    orderId: string,
    completionData: {
      final_quantity: number;
      completion_notes?: string;
    }
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/complete`,
      completionData
    );
  }

  async cancel(
    orderId: string,
    cancellationData: {
      reason: string;
      cancellation_costs?: ProductionCosts;
    }
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/cancel`,
      cancellationData
    );
  }

  // Production Management
  async updateProductionStatus(
    orderId: string,
    update: ProductionUpdate
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/production-status`,
      update
    );
  }

  async getProductionHistory(
    orderId: string,
    params: {
      from_date?: Date;
      to_date?: Date;
      stage?: string;
    } = {}
  ): Promise<ProductionUpdate[]> {
    const queryParams = new URLSearchParams();
    if (params.from_date) queryParams.append('from_date', params.from_date.toISOString());
    if (params.to_date) queryParams.append('to_date', params.to_date.toISOString());
    if (params.stage) queryParams.append('stage', params.stage);

    return this.request<ProductionUpdate[]>(
      'GET',
      `manufacturerorders/${orderId}/production-history?${queryParams.toString()}`
    );
  }

  // Cost Management
  async updateCosts(orderId: string, costs: ProductionCosts): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/costs`,
      {
        ...costs,
        currency: costs.currency || DEFAULT_CURRENCY
      }
    );
  }

  // Material Management
  async allocateMaterials(
    orderId: string,
    materialAllocations: Array<{
      material_id: string;
      quantity: number;
      warehouse_location: string;
    }>
  ): Promise<ManufacturerOrderResponse> {
    return this.request<ManufacturerOrderResponse>(
      'POST',
      `manufacturerorders/${orderId}/allocate-materials`,
      { allocations: materialAllocations }
    );
  }

  // Metrics
  async getManufacturingMetrics(params: {
    from_date?: Date;
    to_date?: Date;
    manufacturer_id?: string;
    org_id?: string;
  } = {}): Promise<{
    total_orders: number;
    completed_orders: number;
    average_production_time: number;
    quality_pass_rate: number;
    total_costs: number;
    status_breakdown: Record<ManufacturerOrderStatus, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (params.from_date) queryParams.append('from_date', params.from_date.toISOString());
    if (params.to_date) queryParams.append('to_date', params.to_date.toISOString());
    if (params.manufacturer_id) queryParams.append('manufacturer_id', params.manufacturer_id);
    if (params.org_id) queryParams.append('org_id', params.org_id);

    return this.request(
      'GET',
      `manufacturerorders/metrics?${queryParams.toString()}`
    );
  }
}

export default ManufacturerOrders;