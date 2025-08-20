import type { ApiClientLike } from '../../types';

// Enums
export enum BOMStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  OBSOLETE = 'OBSOLETE',
  REVISION = 'REVISION'
}

export enum ComponentType {
  RAW_MATERIAL = 'raw_material',
  SUB_ASSEMBLY = 'sub_assembly',
  FINISHED_GOOD = 'finished_good',
  PACKAGING = 'packaging'
}

// Interfaces
export interface Component {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost?: number;
  lead_time?: number; // in days
  type: ComponentType;
  supplier_id?: string;
  notes?: string;
  alternative_items?: string[];
  minimum_order_quantity?: number;
  reorder_point?: number;
}

export interface BOMMetadata {
  version: string;
  effective_date?: string;
  expiry_date?: string;
  approved_by?: string;
  department?: string;
  facility_id?: string;
  [key: string]: any;
}

export interface BOMData {
  name: string;
  description?: string;
  product_id: string;
  components: Component[];
  metadata?: BOMMetadata;
  total_cost?: number;
  assembly_time?: number; // in hours
  revision_notes?: string;
  org_id?: string;
}

// Response Types
interface BaseBOMResponse {
  id: string;
  object: 'billofmaterials';
  created_at: string;
  updated_at: string;
  status: BOMStatus;
  data: BOMData;
}

export type BOMResponse = BaseBOMResponse & {
  [K in BOMStatus]: {
    status: K;
  } & (K extends BOMStatus.REVISION ? { revision: true; previous_version_id: string }
    : K extends BOMStatus.DRAFT ? { draft: true }
    : K extends BOMStatus.ACTIVE ? { active: true }
    : K extends BOMStatus.OBSOLETE ? { obsolete: true }
    : {});
}[BOMStatus];

// Error Classes
export class BOMError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class BOMNotFoundError extends BOMError {
  constructor(bomId: string) {
    super(`Bill of Materials with ID ${bomId} not found`, 'BOMNotFoundError');
  }
}

export class BOMValidationError extends BOMError {
  constructor(message: string) {
    super(message, 'BOMValidationError');
  }
}

export class BOMStateError extends BOMError {
  constructor(message: string) {
    super(message, 'BOMStateError');
  }
}

// Main BillOfMaterials Class
export class BillOfMaterials {
  constructor(private readonly client: ApiClientLike) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await this.client.request(method, path, data);
      return response.update_billofmaterials_by_pk || response;
    } catch (error: any) {
      if (error?.error) {
        throw new BOMValidationError(error.error);
      }
      if (error.status === 404) {
        throw new BOMNotFoundError(path.split('/')[2] || 'unknown');
      }
      if (error.status === 400) {
        throw new BOMStateError(error.message);
      }
      throw error;
    }
  }

  private validateComponent(component: Component): void {
    if (component.quantity <= 0) {
      throw new BOMValidationError(`Invalid quantity ${component.quantity} for component ${component.item_id}`);
    }
    if (component.unit_cost && component.unit_cost < 0) {
      throw new BOMValidationError(`Invalid unit cost ${component.unit_cost} for component ${component.item_id}`);
    }
    if (component.minimum_order_quantity && component.minimum_order_quantity < 0) {
      throw new BOMValidationError(`Invalid MOQ ${component.minimum_order_quantity} for component ${component.item_id}`);
    }
    if (component.lead_time && component.lead_time < 0) {
      throw new BOMValidationError(`Invalid lead time ${component.lead_time} for component ${component.item_id}`);
    }
  }

  async list(params: {
    status?: BOMStatus;
    product_id?: string;
    org_id?: string;
    effective_after?: Date;
    effective_before?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ boms: BOMResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request<{ boms: BOMResponse[]; total: number }>(
      'GET',
      `billofmaterials?${queryParams.toString()}`
    );
  }

  async get(bomId: string): Promise<BOMResponse> {
    return this.request<BOMResponse>('GET', `billofmaterials/${bomId}`);
  }

  async create(bomData: BOMData): Promise<BOMResponse> {
    if (!bomData.components.length) {
      throw new BOMValidationError('BOM must contain at least one component');
    }
    bomData.components.forEach(this.validateComponent);
    return this.request<BOMResponse>('POST', 'billofmaterials', bomData);
  }

  async update(bomId: string, bomData: Partial<BOMData>): Promise<BOMResponse> {
    if (bomData.components) {
      bomData.components.forEach(this.validateComponent);
    }
    return this.request<BOMResponse>('PUT', `billofmaterials/${bomId}`, bomData);
  }

  async delete(bomId: string): Promise<void> {
    await this.request<void>('DELETE', `billofmaterials/${bomId}`);
  }

  // Status Management
  async setActive(bomId: string): Promise<BOMResponse> {
    return this.request<BOMResponse>('POST', `billofmaterials/${bomId}/set-active`);
  }

  async setObsolete(bomId: string): Promise<BOMResponse> {
    return this.request<BOMResponse>('POST', `billofmaterials/${bomId}/set-obsolete`);
  }

  async startRevision(bomId: string, revisionNotes?: string): Promise<BOMResponse> {
    return this.request<BOMResponse>(
      'POST',
      `billofmaterials/${bomId}/start-revision`,
      { revision_notes: revisionNotes }
    );
  }

  async completeRevision(bomId: string): Promise<BOMResponse> {
    return this.request<BOMResponse>('POST', `billofmaterials/${bomId}/complete-revision`);
  }

  // Component Management
  async addComponent(bomId: string, component: Omit<Component, 'id'>): Promise<BOMResponse> {
    this.validateComponent({ ...component, id: 'temp' }); // Temporary ID for validation
    return this.request<BOMResponse>('POST', `billofmaterials/${bomId}/add-component`, component);
  }

  async updateComponent(bomId: string, componentId: string, updates: Partial<Component>): Promise<BOMResponse> {
    this.validateComponent({ ...updates, id: componentId, item_id: 'temp', quantity: updates.quantity || 1, type: ComponentType.RAW_MATERIAL });
    return this.request<BOMResponse>('PUT', `billofmaterials/${bomId}/components/${componentId}`, updates);
  }

  async removeComponent(bomId: string, componentId: string): Promise<BOMResponse> {
    return this.request<BOMResponse>('DELETE', `billofmaterials/${bomId}/components/${componentId}`);
  }

  // Cost Management
  async calculateTotalCost(bomId: string): Promise<{
    total_cost: number;
    currency: string;
    breakdown: Record<string, { quantity: number; unit_cost: number; total: number }>;
  }> {
    return this.request('GET', `billofmaterials/${bomId}/cost-analysis`);
  }

  // Version Management
  async getVersionHistory(bomId: string): Promise<Array<{
    version: string;
    status: BOMStatus;
    changed_by: string;
    timestamp: string;
    changes: Record<string, { old: any; new: any }>;
  }>> {
    return this.request('GET', `billofmaterials/${bomId}/versions`);
  }

  // Export
  async export(bomId: string, format: 'pdf' | 'csv' | 'json'): Promise<{
    url: string;
    generated_at: string;
    expires_at: string;
  }> {
    return this.request('GET', `billofmaterials/${bomId}/export?format=${format}`);
  }

  // Validation
  async validateBOM(bomId: string): Promise<{
    is_valid: boolean;
    issues: Array<{
      component_id?: string;
      type: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }> {
    return this.request('GET', `billofmaterials/${bomId}/validate`);
  }
}

export default BillOfMaterials;