import { stateset } from '../../stateset-client';

// Enums for manufacturing management
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

// Interfaces for manufacturing data structures
export interface ProductionSchedule {
  start_date: string;
  end_date: string;
  shifts: Array<{
    shift_id: string;
    start_time: string;
    end_time: string;
    machine_id?: string;
    operator_id?: string;
  }>;
  milestone_dates: {
    materials_ready?: string;
    production_start?: string;
    quality_check?: string;
    packaging_start?: string;
    shipping_ready?: string;
  };
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

// Response Interfaces
interface BaseManufacturerOrderResponse {
  id: string;
  object: 'manufacturerorder';
  created_at: string;
  updated_at: string;
  status: ManufacturerOrderStatus;
  data: ManufacturerOrderData;
}

interface DraftManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.DRAFT;
  draft: true;
}

interface SubmittedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.SUBMITTED;
  submitted: true;
}

interface InProductionManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.IN_PRODUCTION;
  inProduction: true;
  production_updates: ProductionUpdate[];
}

interface QualityCheckManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.QUALITY_CHECK;
  qualityCheck: true;
  quality_results?: QualityCheckResult;
}

interface CompletedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.COMPLETED;
  completed: true;
  final_costs: ProductionCosts;
  quality_results: QualityCheckResult;
}

interface CancelledManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: ManufacturerOrderStatus.CANCELLED;
  cancelled: true;
  cancellation_reason: string;
  cancellation_costs?: ProductionCosts;
}

export type ManufacturerOrderResponse = 
  | DraftManufacturerOrderResponse 
  | SubmittedManufacturerOrderResponse 
  | InProductionManufacturerOrderResponse 
  | QualityCheckManufacturerOrderResponse
  | CompletedManufacturerOrderResponse 
  | CancelledManufacturerOrderResponse;

// Custom Error Classes
export class ManufacturerOrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Manufacturer order with ID ${orderId} not found`);
    this.name = 'ManufacturerOrderNotFoundError';
  }
}

export class ManufacturerOrderStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManufacturerOrderStateError';
  }
}

export class MaterialRequirementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaterialRequirementError';
  }
}

// Main ManufacturerOrders Class
class ManufacturerOrders {
  constructor(private readonly stateset: stateset) {}

  /**
   * List manufacturer orders with optional filtering
   */
  async list(params?: {
    status?: ManufacturerOrderStatus;
    manufacturer_id?: string;
    product_id?: string;
    priority?: ProductionPriority;
    from_date?: Date;
    to_date?: Date;
    org_id?: string;
  }): Promise<ManufacturerOrderResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.manufacturer_id) queryParams.append('manufacturer_id', params.manufacturer_id);
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.from_date) queryParams.append('from_date', params.from_date.toISOString());
    if (params?.to_date) queryParams.append('to_date', params.to_date.toISOString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `manufacturerorders?${queryParams.toString()}`);
    return response.orders;
  }

  /**
   * Get specific manufacturer order by ID
   */
  async get(orderId: string): Promise<ManufacturerOrderResponse> {
    try {
      const response = await this.stateset.request('GET', `manufacturerorders/${orderId}`);
      return response.order;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ManufacturerOrderNotFoundError(orderId);
      }
      throw error;
    }
  }

  /**
   * Create new manufacturer order
   */
  async create(orderData: ManufacturerOrderData): Promise<ManufacturerOrderResponse> {
    // Validate material requirements
    for (const material of orderData.material_requirements) {
      if (material.quantity <= 0) {
        throw new MaterialRequirementError(
          `Invalid quantity ${material.quantity} for material ${material.material_id}`
        );
      }
    }

    const response = await this.stateset.request('POST', 'manufacturerorders', orderData);
    return response.order;
  }

  /**
   * Update existing manufacturer order
   */
  async update(
    orderId: string, 
    orderData: Partial<ManufacturerOrderData>
  ): Promise<ManufacturerOrderResponse> {
    try {
      const response = await this.stateset.request('PUT', `manufacturerorders/${orderId}`, orderData);
      return response.order;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ManufacturerOrderNotFoundError(orderId);
      }
      throw error;
    }
  }

  /**
   * Delete manufacturer order
   */
  async delete(orderId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `manufacturerorders/${orderId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ManufacturerOrderNotFoundError(orderId);
      }
      throw error;
    }
  }

  /**
   * Status management methods
   */
  async submit(orderId: string): Promise<SubmittedManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/submit`);
    return response.order as SubmittedManufacturerOrderResponse;
  }

  async startProduction(
    orderId: string,
    startData?: {
      machine_id?: string;
      operator_id?: string;
      start_notes?: string;
    }
  ): Promise<InProductionManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST', 
      `manufacturerorders/${orderId}/start-production`,
      startData
    );
    return response.order as InProductionManufacturerOrderResponse;
  }

  async submitQualityCheck(
    orderId: string,
    qualityData: QualityCheckResult
  ): Promise<QualityCheckManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/quality-check`,
      qualityData
    );
    return response.order as QualityCheckManufacturerOrderResponse;
  }

  async complete(
    orderId: string,
    completionData: {
      final_quantity: number;
      completion_notes?: string;
    }
  ): Promise<CompletedManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/complete`,
      completionData
    );
    return response.order as CompletedManufacturerOrderResponse;
  }

  async cancel(
    orderId: string,
    cancellationData: {
      reason: string;
      cancellation_costs?: ProductionCosts;
    }
  ): Promise<CancelledManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/cancel`,
      cancellationData
    );
    return response.order as CancelledManufacturerOrderResponse;
  }

  /**
   * Production management methods
   */
  async updateProductionStatus(
    orderId: string, 
    update: ProductionUpdate
  ): Promise<InProductionManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/production-status`,
      update
    );
    return response.order as InProductionManufacturerOrderResponse;
  }

  async getProductionHistory(
    orderId: string,
    params?: {
      from_date?: Date;
      to_date?: Date;
      stage?: string;
    }
  ): Promise<ProductionUpdate[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.from_date) queryParams.append('from_date', params.from_date.toISOString());
    if (params?.to_date) queryParams.append('to_date', params.to_date.toISOString());
    if (params?.stage) queryParams.append('stage', params.stage);

    const response = await this.stateset.request(
      'GET',
      `manufacturerorders/${orderId}/production-history?${queryParams.toString()}`
    );
    return response.history;
  }

  /**
   * Cost tracking methods
   */
  async updateCosts(
    orderId: string,
    costs: ProductionCosts
  ): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/costs`,
      costs
    );
    return response.order;
  }

  /**
   * Material management methods
   */
  async allocateMaterials(
    orderId: string,
    materialAllocations: Array<{
      material_id: string;
      quantity: number;
      warehouse_location: string;
    }>
  ): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request(
      'POST',
      `manufacturerorders/${orderId}/allocate-materials`,
      { allocations: materialAllocations }
    );
    return response.order;
  }
}

export default ManufacturerOrders;