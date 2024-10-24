import { stateset } from '../../stateset-client';

// Enums and Types
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

// Interfaces for BOM data structures
export interface Component {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost?: number;
  lead_time?: number;
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
  assembly_time?: number;
  revision_notes?: string;
  org_id?: string;
}

// Response Interfaces
interface BaseBOMResponse {
  id: string;
  object: 'billofmaterials';
  created_at: string;
  updated_at: string;
  status: BOMStatus;
  data: BOMData;
}

interface DraftBOMResponse extends BaseBOMResponse {
  status: BOMStatus.DRAFT;
  draft: true;
}

interface ActiveBOMResponse extends BaseBOMResponse {
  status: BOMStatus.ACTIVE;
  active: true;
}

interface ObsoleteBOMResponse extends BaseBOMResponse {
  status: BOMStatus.OBSOLETE;
  obsolete: true;
}

interface RevisionBOMResponse extends BaseBOMResponse {
  status: BOMStatus.REVISION;
  revision: true;
  previous_version_id: string;
}

export type BOMResponse = 
  | DraftBOMResponse 
  | ActiveBOMResponse 
  | ObsoleteBOMResponse 
  | RevisionBOMResponse;

// Custom Error Classes
export class BOMNotFoundError extends Error {
  constructor(bomId: string) {
    super(`Bill of Materials with ID ${bomId} not found`);
    this.name = 'BOMNotFoundError';
  }
}

export class BOMValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BOMValidationError';
  }
}

export class BOMStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BOMStateError';
  }
}

// Main BillOfMaterials Class
class BillOfMaterials {
  constructor(private readonly stateset: stateset) {}

  /**
   * Validates a BOM component
   */
  private validateComponent(component: Component): void {
    if (component.quantity <= 0) {
      throw new BOMValidationError('Component quantity must be greater than 0');
    }
    
    if (component.minimum_order_quantity && component.minimum_order_quantity < 0) {
      throw new BOMValidationError('Minimum order quantity cannot be negative');
    }
    
    if (component.unit_cost && component.unit_cost < 0) {
      throw new BOMValidationError('Unit cost cannot be negative');
    }
  }

  /**
   * Processes API response into typed BOMResponse
   */
  private handleCommandResponse(response: any): BOMResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_billofmaterials_by_pk) {
      throw new Error('Unexpected response format');
    }

    const bomData = response.update_billofmaterials_by_pk;

    const baseResponse: BaseBOMResponse = {
      id: bomData.id,
      object: 'billofmaterials',
      created_at: bomData.created_at,
      updated_at: bomData.updated_at,
      status: bomData.status,
      data: bomData.data
    };

    switch (bomData.status) {
      case BOMStatus.DRAFT:
        return { ...baseResponse, status: BOMStatus.DRAFT, draft: true };
      case BOMStatus.ACTIVE:
        return { ...baseResponse, status: BOMStatus.ACTIVE, active: true };
      case BOMStatus.OBSOLETE:
        return { ...baseResponse, status: BOMStatus.OBSOLETE, obsolete: true };
      case BOMStatus.REVISION:
        return { 
          ...baseResponse, 
          status: BOMStatus.REVISION, 
          revision: true,
          previous_version_id: bomData.previous_version_id 
        };
      default:
        throw new Error(`Unexpected BOM status: ${bomData.status}`);
    }
  }

  /**
   * List all BOMs with optional filtering
   */
  async list(params?: {
    status?: BOMStatus;
    product_id?: string;
    org_id?: string;
    effective_after?: Date;
    effective_before?: Date;
  }): Promise<BOMResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.effective_after) queryParams.append('effective_after', params.effective_after.toISOString());
    if (params?.effective_before) queryParams.append('effective_before', params.effective_before.toISOString());

    const response = await this.stateset.request('GET', `billofmaterials?${queryParams.toString()}`);
    return response.map((bom: any) => this.handleCommandResponse({ update_billofmaterials_by_pk: bom }));
  }

  /**
   * Get a specific BOM by ID
   */
  async get(bomId: string): Promise<BOMResponse> {
    try {
      const response = await this.stateset.request('GET', `billofmaterials/${bomId}`);
      return this.handleCommandResponse({ update_billofmaterials_by_pk: response });
    } catch (error: any) {
      if (error.status === 404) {
        throw new BOMNotFoundError(bomId);
      }
      throw error;
    }
  }

  /**
   * Create a new BOM
   */
  async create(bomData: BOMData): Promise<BOMResponse> {
    // Validate all components
    bomData.components.forEach(this.validateComponent);

    const response = await this.stateset.request('POST', 'billofmaterials', bomData);
    return this.handleCommandResponse(response);
  }

  /**
   * Update an existing BOM
   */
  async update(bomId: string, bomData: Partial<BOMData>): Promise<BOMResponse> {
    if (bomData.components) {
      bomData.components.forEach(this.validateComponent);
    }

    try {
      const response = await this.stateset.request('PUT', `billofmaterials/${bomId}`, bomData);
      return this.handleCommandResponse(response);
    } catch (error: any) {
      if (error.status === 404) {
        throw new BOMNotFoundError(bomId);
      }
      throw error;
    }
  }

  /**
   * Delete a BOM
   */
  async delete(bomId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `billofmaterials/${bomId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new BOMNotFoundError(bomId);
      }
      throw error;
    }
  }

  /**
   * Status management methods
   */
  async setActive(bomId: string): Promise<ActiveBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${bomId}/set-active`);
    return this.handleCommandResponse(response) as ActiveBOMResponse;
  }

  async setObsolete(bomId: string): Promise<ObsoleteBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${bomId}/set-obsolete`);
    return this.handleCommandResponse(response) as ObsoleteBOMResponse;
  }

  async startRevision(bomId: string, revisionNotes?: string): Promise<RevisionBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${bomId}/start-revision`, { revision_notes: revisionNotes });
    return this.handleCommandResponse(response) as RevisionBOMResponse;
  }

  async completeRevision(bomId: string): Promise<ActiveBOMResponse> {
    const response = await this.stateset.request('POST', `billofmaterials/${bomId}/complete-revision`);
    return this.handleCommandResponse(response) as ActiveBOMResponse;
  }

  /**
   * Component management methods
   */
  async addComponent(bomId: string, component: Component): Promise<BOMResponse> {
    this.validateComponent(component);
    const response = await this.stateset.request('POST', `billofmaterials/${bomId}/add-component`, component);
    return this.handleCommandResponse(response);
  }

  async updateComponent(bomId: string, componentId: string, updates: Partial<Component>): Promise<BOMResponse> {
    const response = await this.stateset.request('PUT', `billofmaterials/${bomId}/components/${componentId}`, updates);
    return this.handleCommandResponse(response);
  }

  async removeComponent(bomId: string, componentId: string): Promise<BOMResponse> {
    const response = await this.stateset.request('DELETE', `billofmaterials/${bomId}/components/${componentId}`);
    return this.handleCommandResponse(response);
  }

  /**
   * Cost calculation methods
   */
  async calculateTotalCost(bomId: string): Promise<{ total_cost: number; breakdown: Record<string, number> }> {
    const response = await this.stateset.request('GET', `billofmaterials/${bomId}/cost-analysis`);
    return response;
  }

  /**
   * Version management methods
   */
  async getVersionHistory(bomId: string): Promise<Array<BOMResponse & { version: string; changed_by: string; timestamp: string }>> {
    const response = await this.stateset.request('GET', `billofmaterials/${bomId}/versions`);
    return response.versions;
  }

  /**
   * Export methods
   */
  async export(bomId: string, format: 'pdf' | 'csv' | 'json'): Promise<string> {
    const response = await this.stateset.request('GET', `billofmaterials/${bomId}/export?format=${format}`);
    return response.url;
  }
}

export default BillOfMaterials;